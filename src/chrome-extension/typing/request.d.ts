export type IRecord = {
  material_url: string;
  status: 'waiting' | 'recording' | 'record_complete' | 'aoc_consume';
  task_hash: string;
  merge_result_url: string;
  screen_size: string;
}[];
