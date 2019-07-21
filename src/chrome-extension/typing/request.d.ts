export type IRecord = {
  material_url: string;
  status: 'waiting' | 'recording' | 'record_complete' | 'record_fail' | 'aoc_consume';
  id: number;
  merge_result_url: string;
  sub_s3_key: string;
  version: number;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  deleted: string;
  deleted_at: string;
  room_aggregation_task_id: number;
}[];
