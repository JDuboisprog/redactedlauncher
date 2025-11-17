export type UserRole = "requester" | "worker" | "admin";

export type TaskStatus =
  | "draft"
  | "funding"
  | "active"
  | "in_review"
  | "completed"
  | "denied"
  | "disputed";

export type SubmissionStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "approved"
  | "denied"
  | "disputed";

export type DisputeStatus =
  | "open"
  | "resolved_requester"
  | "resolved_worker"
  | "refunded";

export interface WalletMetadata {
  ownerId: string;
  role: UserRole;
  address: string;
  escrowAccount?: string;
  lastSyncedAt?: string;
}

export interface LabelEntry {
  rowIndex: number;
  payload: Record<string, string>;
  label: string;
  confidence: number;
  updatedAt: string;
}

export interface SubmissionRecord {
  id: string;
  taskId: string;
  workerId: string;
  workerWallet: string;
  status: SubmissionStatus;
  entries: LabelEntry[];
  fileKey?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  instructions: string;
  csvKey: string;
  csvFileName: string;
  csvPreview: string[];
  rowCount: number;
  pricePerRowLamports: number;
  totalEscrowLamports: number;
  paidLamports: number;
  requesterId: string;
  requesterWallet: string;
  workerId?: string;
  workerWallet?: string;
  status: TaskStatus;
  escrowAccount?: string;
  submissions: SubmissionRecord["id"][];
  validatedRows: number;
  disputeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeRecord {
  id: string;
  taskId: string;
  submissionId: string;
  raisedBy: "requester" | "worker";
  raisedById: string;
  reason: string;
  evidenceKeys: string[];
  status: DisputeStatus;
  resolutionNote?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEvent {
  id: string;
  taskId: string;
  submissionId?: string;
  txSignature: string;
  amountLamports: number;
  direction: "escrow_fund" | "release_to_worker" | "refund_requester";
  createdAt: string;
}

