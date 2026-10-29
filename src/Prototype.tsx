import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CircleIcon, MinusCircledIcon, ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from '@radix-ui/react-icons';
import { STORAGE_KEY, key, dateOf, challengeEnd, statistics, type Tracker, type Status } from './logic';

const label = (status?:Status) => status==='yes'?'잤음':status==='no'?'안 잤음':'미기록';
function StatusMark({status}:{status?:Status}) {
 return status==='yes'?<span className="status-mark yes"><CheckIcon /></span>:status==='no'?<MinusCircledIcon className="status-mark no"/>:<CircleIcon className="status-mark empty"/>;
}
function readTracker():Tracker {
 const raw=localStorage.getItem(STORAGE_KEY);
 if(raw){const saved=JSON.parse(raw);if(/^\d{4}-\d{2}-\d{2}$/.test(saved.start) && saved.records && typeof saved.records==='object') return {start:saved.start,records:Object.fromEntries(Object.entries(saved.records).filter(([,v])=>v==='yes'||v==='no'))} as Tracker;}
 const initial={start:key(new Date()),records:{}};
 localStorage.setItem(STORAGE_KEY,JSON.stringify(initial));return initial;
}
export default function Prototype() {
 const [today,setToday]=useState(()=>key(new Date()));
 const [initial]=useState(()=>{try{return {data:readTracker(),error:''};}catch{return {data:{start:key(new Date()),records:{}} as Tracker,error:'기록 저장소에 접근할 수 없습니다. 브라우저의 저장 허용 설정을 확인해주세요.'};}});
 const [data,setData]=useState<Tracker>(initial.data),[error,setError]=useState(initial.error);
 const [month,setMonth]=useState(()=>key(new Date()).slice(0,7));
 const [editing,setEditing]=useState<string|null>(null),[notice,setNotice]=useState('');
 const dialog=useRef<HTMLDialogElement>(null);
 const {end,total,done,progress,streak,day}=statistics(data,today);
 useEffect(()=>{const refresh=()=>setToday(key(new Date()));const id=setInterval(refresh,60000);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);return()=>{clearInterval(id);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};},[]);
 useEffect(()=>{const sync=(e:StorageEvent)=>{if(e.key===STORAGE_KEY && e.newValue){try{setData(readTracker());}catch{setError('기록을 불러오지 못했습니다. 새로고침해주세요.');}}};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
 useEffect(()=>{if(editing && dialog.current && !dialog.current.open)dialog.current.showModal();},[editing]);
 const canRecord=(d:string)=>d>=data.start && d<=today && d<=end;
 function save(d:string,status:Status){
  const actualToday=key(new Date());setToday(actualToday);
  if(d<data.start || d>end || d>actualToday){setError('챌린지 기간의 오늘 또는 지난 날짜만 기록할 수 있습니다.');return;}
  const next={...data,records:{...data.records,[d]:status}};
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setData(next);setError('');setNotice(`${dateOf(d).getMonth()+1}월 ${dateOf(d).getDate()}일 · ${label(status)} 저장됨`);if(editing){dialog.current?.close();setEditing(null);}}
  catch{setError('저장하지 못했습니다. 브라우저의 저장 공간과 설정을 확인해주세요.');}
 }
 const displayedMonth=dateOf(`${month}-01`), first=displayedMonth.getDay();
 const count=new Date(displayedMonth.getFullYear(),displayedMonth.getMonth()+1,0).getDate();
 const previous=key(new Date(displayedMonth.getFullYear(),displayedMonth.getMonth()-1,1)).slice(0,7);
 const next=key(new Date(displayedMonth.getFullYear(),displayedMonth.getMonth()+1,1)).slice(0,7);
 const short=(d:string)=>`${String(dateOf(d).getMonth()+1).padStart(2,'0')}.${String(dateOf(d).getDate()).padStart(2,'0')}`;
 function recordButtons(d:string){return <div className="record-buttons"><button className="record yes-button" disabled={!canRecord(d)} aria-pressed={data.records[d]==='yes'} onClick={()=>save(d,'yes')}><CheckIcon/>잤음</button><button className="record no-button" disabled={!canRecord(d)} aria-pressed={data.records[d]==='no'} onClick={()=>save(d,'no')}><MinusCircledIcon/>안 잤음</button></div>;}
 return <main className="tracker">
  <header><h1>낮잠 기록</h1><div className="date-row"><time dateTime={today}>{dateOf(today).toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'})}</time><div className="day-info"><strong>Day {day} / {total}</strong><span>{short(data.start)} – {short(end)}</span></div></div></header>
  <section className="today" aria-labelledby="goal"><p className="eyebrow">오늘의 목표</p><h2 id="goal">낮잠 자기</h2><div className="today-status"><StatusMark status={data.records[today]}/><span>{today>end?'챌린지 종료':label(data.records[today])}</span></div>{recordButtons(today)}<div className="save-notice" role="status" aria-live="polite">{notice}</div>{error && <p className="error" role="alert">{error}</p>}</section>
  <section className="metrics" aria-label="챌린지 진행 상황"><div className="streak"><h3>현재 연속</h3><strong>{streak}<small>일</small></strong></div><div className="completion"><h3>전체 진행률</h3><div className="progress-value"><strong>{progress}%</strong><span>{done} / {total}일</span></div><progress max={total} value={done} aria-label="낮잠 잤음 기록 진행률"/><p className="progress-caption">잤음 기록 / 전체 기간</p></div></section>
  <section className="history" aria-labelledby="month-title"><div className="calendar-heading"><h2 id="month-title">{displayedMonth.getFullYear()}년 {displayedMonth.getMonth()+1}월</h2><div className="month-navigation"><button aria-label="이전 달" disabled={previous<data.start.slice(0,7)} onClick={()=>setMonth(previous)}><ChevronLeftIcon/></button><button aria-label="다음 달" disabled={next>end.slice(0,7)} onClick={()=>setMonth(next)}><ChevronRightIcon/></button></div></div><p className="calendar-hint">지난 날짜를 눌러 수정</p>
  <div className="weekdays" aria-hidden="true">{['일','월','화','수','목','금','토'].map((d,i)=><span key={d} className={i===0?'sunday':i===6?'saturday':''}>{d}</span>)}</div>
  <div className="calendar" aria-label={`${displayedMonth.getMonth()+1}월 기록`}>{Array.from({length:first},(_,i)=><span key={`blank${i}`} className="calendar-blank"/>)}{Array.from({length:count},(_,i)=>{const number=i+1,d=`${month}-${String(number).padStart(2,'0')}`,inRange=d>=data.start&&d<=end,status=data.records[d];return <button key={d} className={`calendar-day ${d===today?'is-today':''} ${!inRange?'outside':''}`} disabled={!canRecord(d)} aria-current={d===today?'date':undefined} aria-label={`${dateOf(d).toLocaleDateString('ko-KR',{month:'long',day:'numeric'})}, ${!inRange?'챌린지 기간 아님':d>today?'미래 날짜':label(status)}`} onClick={()=>setEditing(d)}><span>{number}</span>{inRange && d<=today && <StatusMark status={status}/>}</button>;})}</div>
  <div className="legend"><span><StatusMark status="yes"/>잤음</span><span><StatusMark status="no"/>안 잤음</span><span><StatusMark/>미기록</span><span className="muted-legend">흐린 날짜는 기록 불가</span></div>
  </section>
  <dialog ref={dialog} onCancel={()=>setEditing(null)} onClose={()=>setEditing(null)} aria-labelledby="edit-heading"><div className="dialog-heading"><h2 id="edit-heading">{editing && dateOf(editing).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'})} 기록</h2><button aria-label="닫기" onClick={()=>{dialog.current?.close();setEditing(null);}}><Cross2Icon/></button></div><div className="edit-status"><StatusMark status={editing?data.records[editing]:undefined}/>{label(editing?data.records[editing]:undefined)}</div>{editing && recordButtons(editing)}</dialog>
 </main>;
}
