#include "fsm.h"
#include <fstream>
#include <functional>
#include <string>
#include <cassert>

/**
 * Simulate change of state given a symbol in-place. Functionally handle any
 * possible callbacks upon changing of states.
 * @param state_id  the index of the current state
 * @param symbol_id the index of the symbol used for transition
 * @param handler   a callback function that handles what happens when a particular
 *                  state is being visited
 */
bool rainscript::fsm::next(
    int& state_id,
    int symbol_id,
    std::function<bool(int, int, const std::string&)> handler
) const {
    while (matrix[state_id] == NULL) {
        state_id = null[state_id];
        for (int i = 0; i < n_callbacks[state_id]; ++i)
            if (!handler(state_id, symbol_id, callbacks[state_id][i]))
                return false;
    }
    state_id = (!(0 <= symbol_id && symbol_id < n_symbols) || matrix[state_id][symbol_id] == -1)
        ? fallback[state_id]
        : matrix[state_id][symbol_id];
    for (int i = 0; i < n_callbacks[state_id]; ++i)
        if (!handler(state_id, symbol_id, callbacks[state_id][i]))
            return false;
    while (matrix[state_id] == NULL) {
        state_id = null[state_id];
        for (int i = 0; i < n_callbacks[state_id]; ++i)
            if (!handler(state_id, symbol_id, callbacks[state_id][i]))
                return false;
    }
    return true;
}

/**
 * Default protected constructor for rainscript::fsm.
 */
rainscript::fsm::fsm() {}

/**
 * Constructs a finite state machine given description from a file.
 */
rainscript::fsm rainscript::fsm::create_from_file(const char filename[])
{
    rainscript::fsm fsm;

    static std::string buffer;
    std::ifstream fin(filename);
    assert(fin.is_open()); // TODO: throw error

    // read size
    fin >> fsm.n_states >> fsm.n_symbols >> fsm.start_state;

    // allocate state and callbacks
    fsm.states = new std::string[fsm.n_states];
    fsm.n_callbacks = new int[fsm.n_states];
    fsm.callbacks = new std::string*[fsm.n_states];
    fsm.fallback = new int[fsm.n_states];

    // read state names and callbacks
    for (int i = 0; i < fsm.n_states; ++i) {
        int& length = fsm.n_callbacks[i];
        fin >> fsm.states[i] >> fsm.fallback[i] >> length;
        if (length > 0) {
            fsm.callbacks[i] = new std::string[length];
            for (int j = 0; j < length; ++j)
                fin >> fsm.callbacks[i][j];
        } else {
            fsm.callbacks[i] = NULL;
        }
    }

    // move cursor down
    getline(fin, buffer);

    // allocate symbols
    fsm.symbols = new std::string[fsm.n_symbols];

    // read symbols per line
    for (int i = 0; i < fsm.n_symbols; ++i) {
        getline(fin, fsm.symbols[i], '\0');
    }

    // allocate null pointers and fsm adjacency matrix
    fsm.null = new int[fsm.n_states];
    fsm.matrix = new int*[fsm.n_states];

    // read matrix, L means list, N means null
    for (int i = 0; i < fsm.n_states; ++i) {
        fin >> buffer;
        if (buffer == "L") {
            fsm.null[i] = -1;
            // read list
            fsm.matrix[i] = new int[fsm.n_symbols];
            for (int j = 0; j < fsm.n_symbols; ++j)
                fin >> fsm.matrix[i][j];
        } else if (buffer == "N") {
            fsm.matrix[i] = NULL;
            fin >> fsm.null[i];
        } else {
            assert(false);
        }

    }

    return fsm;

}

/**
 * Garbage collection of this finite state machine.
 */
rainscript::fsm::~fsm()
{
    for (int i = 0; i < n_states; ++i) {
        if (callbacks[i]) delete[] callbacks[i];
        if (matrix[i]) delete[] matrix[i];
    }
    if (states) delete[] states;
    if (symbols) delete[] symbols;
    if (callbacks) delete[] callbacks;
    if (n_callbacks) delete[] n_callbacks;
    if (null) delete[] null;
    if (fallback) delete[] fallback;
    if (matrix) delete[] matrix;
}

