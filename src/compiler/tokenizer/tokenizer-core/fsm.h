#ifndef __rainscript_include_fsm
#define __rainscript_include_fsm

#include <string>     // std::string
#include <functional> // std::function

namespace rainscript {

    class fsm {
    public:

        int n_states;
        int n_symbols;
        int start_state;

        std::string *states;
        std::string *symbols;

        int *n_callbacks;
        std::string **callbacks;

        int *null;
        int *fallback;
        int **matrix;

        /**
         * Simulate change of state given a symbol in-place. Functionally handle any
         * possible callbacks upon changing of states.
         * @param state_id  the index of the current state
         * @param symbol_id the index of the symbol used for transition
         * @param handler   a callback function that handles what happens when a particular
         *                  state is being visited
         */
        bool next(
            int& state_id,
            int symbol_id,
            std::function<bool(int, int, const std::string&)> handler
        ) const;

        /**
         * Constructs a finite state machine given description from a file.
         */
        fsm(const char filename[]);

        /**
         * Garbage collection of this finite state machine.
         */
        ~fsm();

    };

}

#endif /* __rainscript_include_fsm */
