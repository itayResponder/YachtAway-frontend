import yachtService from '@/services/yacht.service';

export default {
    state: {
        yachts: []
    },

    mutations: {
        setYachts(state, context) {
            state.yachts = context.yachts;
        },

        updateYacht({ yachts }, { savedYacht }) {
            const idx = yachts.findIndex(currYacht => currYacht._id === savedYacht._id);
            yachts.splice(idx, 1, savedYacht);
        },

        addNewYacht({ yachts }, { savedYacht }) {
            yachts.unshift(savedYacht);
        },

        removeYacht({ yachts }, { yachtId }) {
            const idx = yachts.findIndex(yacht => yacht._id === yachtId);
            yachts.splice(idx, 1);
        },
    },

    getters: {
        yachtsToShow({ yachts }) {
            return yachts;
        }
    },

    actions: {
        async loadYachts({ commit }) {
            try {
                var yachts = await yachtService.query()
                commit({ type: "setYachts", yachts })
                return yachts;
            } catch (err) {
                console.log("Could not find yachts  error:", err);
                return err;
            }
        },

        async getYachtById(context, { yachtId }) {
            try {
                var yacht = await yachtService.getById(yachtId)
                return yacht;
            } catch (err) {
                console.log('YachtStore getById Could not find yacht error:', err)
                return err;
            }
        },

        async removeYacht({ commit }, { yachtId }) {
            try {
                const yachtRemoved = await yachtService.remove(yachtId)
                commit({ type: 'removeYacht', yachtId })
                return yachtRemoved;
            } catch (err) {
                console.log('Could not delete yacht error:', err);
                return err;
            }
        },

        async saveYacht({ commit }, { yacht }) {
            try {
                var savedYacht;
                if (yacht._id) {
                    savedYacht = await yachtService.save(yacht)
                    commit({ type: 'updateYacht', savedYacht })
                } else {
                    savedYacht = await yachtService.save(yacht)
                    commit({ type: 'addNewYacht', savedYacht })
                }
                return savedYacht;
            } catch (err) {
                console.log('Could not save yacht err:', err);
                return err;
            }
        }
    }
}