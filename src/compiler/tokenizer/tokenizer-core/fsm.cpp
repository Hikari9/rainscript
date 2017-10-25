#include "fsm.h"
#include <iostream>
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
 * Constructs a finite state machine given description from a file.
 */
rainscript::fsm::fsm(const char filename[])
{
    static std::string buffer;
    std::ifstream fin(filename);
    assert(fin.is_open()); // TODO: throw error

    // read size
    fin >> n_states >> n_symbols >> start_state;

    // allocate state and callbacks
    states = new std::string[n_states];
    n_callbacks = new int[n_states];
    callbacks = new std::string*[n_states];
    fallback = new int[n_states];

    // read state names and callbacks
    for (int i = 0; i < n_states; ++i) {
        int& length = n_callbacks[i];
        fin >> states[i] >> fallback[i] >> length;
        if (length > 0) {
            callbacks[i] = new std::string[length];
            for (int j = 0; j < length; ++j)
                fin >> callbacks[i][j];
        } else {
            callbacks[i] = NULL;
        }
    }

    // move cursor down
    getline(fin, buffer);

    // allocate symbols
    symbols = new std::string[n_symbols];

    // read symbols per line
    for (int i = 0; i < n_symbols; ++i) {
        getline(fin, symbols[i], '\0');
    }

    // allocate null pointers and fsm adjacency matrix
    null = new int[n_states];
    matrix = new int*[n_states];

    // read matrix, L means list, N means null
    for (int i = 0; i < n_states; ++i) {
        fin >> buffer;
        if (buffer == "L") {
            null[i] = -1;
            // read list
            matrix[i] = new int[n_symbols];
            for (int j = 0; j < n_symbols; ++j)
                fin >> matrix[i][j];
        } else if (buffer == "N") {
            matrix[i] = NULL;
            fin >> null[i];
        } else {
            assert(false);
        }

    }
}

/**
 * Garbage collection of this finite state machine.
 */
rainscript::fsm::~fsm()
{
    for (int i = 0; i < n_states; ++i) {
        if (callbacks[i] != NULL)
            delete[] callbacks[i];
        if (matrix[i] != NULL)
            delete[] matrix[i];
    }
    delete[] states;
    delete[] symbols;
    delete[] callbacks;
    delete[] n_callbacks;
    delete[] null;
    delete[] fallback;
    delete[] matrix;
}

