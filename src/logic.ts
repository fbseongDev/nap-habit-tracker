export type Status = 'yes' | 'no';
export type Tracker = { start: string; records: Record<string, Status> };
export const STORAGE_KEY = 'nap-tracker:v1';
export function key(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function dateOf(value: string): Date {
  const [y,m,d] = value.split('-').map(Number);
  return new Date(y,m-1,d,12);
}
export function addDays(value: string, amount: number): string {
  const d = dateOf(value); d.setDate(d.getDate()+amount); return key(d);
}
export function dayDiff(a: string,b: string): number {
  const utc = (s:string) => { const d=dateOf(s); return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()); };
  return Math.round((utc(b)-utc(a))/86400000);
}
export function challengeEnd(start: string): string {
  const d=dateOf(start), targetMonth=d.getMonth()+1;
  const next=new Date(d.getFullYear(),targetMonth,1,12);
  const lastDay=new Date(next.getFullYear(),next.getMonth()+1,0,12).getDate();
  next.setDate(Math.min(d.getDate(),lastDay));
  return addDays(key(next),-1);
}
export function statistics(data:Tracker,today:string) {
  const end=challengeEnd(data.start), total=dayDiff(data.start,end)+1;
  const done=Object.entries(data.records).filter(([d,s])=>s==='yes' && d>=data.start && d<=end && d<=today).length;
  let cursor=today>end?end:today;
  if (!data.records[cursor] && cursor===today) cursor=addDays(cursor,-1);
  let streak=0;
  while(cursor>=data.start && data.records[cursor]==='yes'){streak++;cursor=addDays(cursor,-1);}
  return {end,total,done,progress:Math.round(done/total*100),streak,day:Math.min(total,Math.max(1,dayDiff(data.start,today)+1))};
}
