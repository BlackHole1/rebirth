export type IRecord = {
  material_url: string;
  status: 'waiting' | 'recording' | 'record_complete' | 'aoc_consume';
  id: number;
  merge_result_url: string;
  sub_s3_key: string;
}[];
