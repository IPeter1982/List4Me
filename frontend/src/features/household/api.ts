import { api } from "@/lib/api"

export type HouseholdMember = { id: string; displayName: string; role: string; joinedAt: string }
export type Household = { id: string; name: string; createdAt: string; members: HouseholdMember[] }
export type Invite = { token: string; inviteUrl: string; expiresAt: string }
export type InviteInfo = { token: string; householdName: string; expiresAt: string }

export const householdApi = {
  getMe: () => api<Household>("/api/households/me"),
  create: (name: string) => api<Household>("/api/households", {
    method: "POST", body: JSON.stringify({ name })
  }),
  update: (name: string) => api<void>("/api/households/me", {
    method: "PATCH", body: JSON.stringify({ name })
  }),
  createInvite: (email?: string) => api<Invite>("/api/households/me/invites", {
    method: "POST", body: JSON.stringify({ email: email ?? null })
  }),
  getInvite: (token: string) => api<InviteInfo>(`/api/invites/${token}`),
  acceptInvite: (token: string) => api<void>(`/api/invites/${token}/accept`, { method: "POST" })
}
