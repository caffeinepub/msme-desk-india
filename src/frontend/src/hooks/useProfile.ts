import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BusinessProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const profileQuery = useQuery<BusinessProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (profile: BusinessProfile) => {
      if (!actor) throw new Error("No actor available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const upsertProfileMutation = useMutation({
    mutationFn: async (profile: BusinessProfile) => {
      if (!actor) throw new Error("No actor available");
      await actor.upsertProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    saveProfile: saveProfileMutation.mutateAsync,
    upsertProfile: upsertProfileMutation.mutateAsync,
    isSaving: saveProfileMutation.isPending || upsertProfileMutation.isPending,
    refetch: profileQuery.refetch,
  };
}

export const emptyProfile = (): BusinessProfile => ({
  businessName: "",
  address: "",
  phone: "",
  email: "",
  gstin: "",
  pan: "",
  iecCode: "",
  udyamNumber: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  authorizedSignatory: "",
  signatoryDesignation: "",
  profileComplete: false,
  createdAt: BigInt(0),
  updatedAt: BigInt(0),
});
