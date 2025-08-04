import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Reward {
  id: string;
  name: string;
  description: string;
  level: number;
  xpRequired: number;
  userId: string;
  unlocked: boolean;
  claimedAt?: string;
  createdAt: string;
  imageUrl?: string; // Optional image URL for reward
}

interface RewardsState {
  rewards: Reward[];
  addReward: (reward: Omit<Reward, "id" | "createdAt" | "unlocked">) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  claimReward: (id: string) => void;
  getRewardsForUser: (userId: string) => Reward[];
  getNextReward: (userId: string, currentXP: number) => Reward | null;
  getCurrentLevel: (userId: string, currentXP: number) => number;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      rewards: [],

      addReward: (rewardData) => {
        const newReward: Reward = {
          ...rewardData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          unlocked: false,
        };

        set((state) => ({
          rewards: [...state.rewards, newReward],
        }));
      },

      updateReward: (id, updates) => {
        set((state) => ({
          rewards: state.rewards.map((reward) =>
            reward.id === id ? { ...reward, ...updates } : reward
          ),
        }));
      },

      deleteReward: (id) => {
        set((state) => ({
          rewards: state.rewards.filter((reward) => reward.id !== id),
        }));
      },

      claimReward: (id) => {
        set((state) => ({
          rewards: state.rewards.map((reward) =>
            reward.id === id
              ? {
                  ...reward,
                  unlocked: true,
                  claimedAt: new Date().toISOString(),
                }
              : reward
          ),
        }));
      },

      getRewardsForUser: (userId) => {
        return get()
          .rewards.filter((reward) => reward.userId === userId)
          .sort((a, b) => a.level - b.level);
      },

      getNextReward: (userId, currentXP) => {
        const userRewards = get().getRewardsForUser(userId);
        return (
          userRewards.find(
            (reward) => !reward.unlocked && reward.xpRequired > currentXP
          ) || null
        );
      },

      getCurrentLevel: (userId, currentXP) => {
        const userRewards = get().getRewardsForUser(userId);
        const unlockedRewards = userRewards.filter(
          (reward) => reward.xpRequired <= currentXP
        );
        return unlockedRewards.length > 0
          ? Math.max(...unlockedRewards.map((r) => r.level))
          : 1;
      },
    }),
    {
      name: "rewards-storage",
    }
  )
);
