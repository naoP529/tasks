export type BlockType = 'routine' | 'task' | 'plan';

export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: string;
  provider_user_id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
}

export interface Block {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_repeated: boolean;
  type: BlockType;
  default_duration: number;
}

export interface BlockDetail {
  block_id: string;
  name: string;
  description: string;
  default_duration: number;
  type: BlockType;
  is_repeated: boolean;
  plan?: Plan | null;
  repeat?: Repeat | null;
}

export interface CreateBlockBody {
  name: string;
  type: BlockType;
  description?: string;
  is_repeated?: boolean;
  default_duration?: number;
}

export type UpdateBlockBody = Partial<Omit<CreateBlockBody, 'type'>> & {
  type?: BlockType;
};

export interface Plan {
  block_id?: string;
  place_name: string;
  place_lat?: string | number | null;
  place_lng?: string | number | null;
}

export interface CreatePlanBody {
  block_id: string;
  place_name: string;
  place_lat?: number;
  place_lng?: number;
}

export type UpdatePlanBody = Partial<Omit<CreatePlanBody, 'block_id'>>;

export interface Repeat {
  repeat_id: string;
  block_id?: string;
  type: RepeatType;
  start_time: string;
  day_of_the_week?: number[] | null;
  day_of_the_month?: number | null;
  month?: number | null;
  end_date?: string | null;
}

export interface CreateRepeatBody {
  block_id: string;
  type: RepeatType;
  start_time: string;
  day_of_the_week?: number[];
  day_of_the_month?: number;
  month?: number;
  end_date?: string;
}

export type UpdateRepeatBody = Partial<Omit<CreateRepeatBody, 'block_id'>>;

export interface Schedule {
  id: string;
  block_id: string;
  start_at?: string | null;
  end_at?: string | null;
  deadline?: string | null;
  repeat_id?: string | null;
  is_finished?: boolean;
  finished_at?: string | null;
}

export interface CreateScheduleBody {
  block_id: string;
  start_at?: string;
  end_at?: string;
  deadline?: string;
  repeat_id?: string;
}

export type UpdateScheduleBody = Partial<
  Pick<Schedule, 'start_at' | 'end_at' | 'deadline' | 'is_finished' | 'finished_at'>
>;

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface CalendarParams {
  start: string;
  end: string;
}

export interface CalendarEvent extends Schedule {
  name?: string;
  type?: BlockType;
}

export interface FinishedBlockItem {
  id: string;
  deadline: string | null;
  finished_at: string;
  name: string;
  type: BlockType;
}

export interface PaginatedFinishedBlocks {
  total: number;
  items: FinishedBlockItem[];
}

export interface LoginRecord {
  id: string;
  user_id: string;
  date: string;
  logged_in_at: string;
}

export interface PaginatedLoginHistory {
  total: number;
  items: LoginRecord[];
}

export interface HealthResponse {
  status: string;
}

export interface ApiErrorBody {
  error: string;
}
