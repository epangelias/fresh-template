import { useSignal } from '@preact/signals';
import { watchData } from '../lib/watch-data.ts';
import { CounterData } from '@/lib/types.ts';

export default function Counter({ data }: { data: CounterData }) {
  const counterData = useSignal(data);

  watchData('/api/counter', counterData);

  return (
    <div class='counter text-center'>
      <button onClick={() => counterData.value = { count: counterData.value.count - 1 }}>- 1</button>{' '}
      <button onClick={() => counterData.value = { count: counterData.value.count + 1 }}>+ 1</button>
      <h2>{counterData.value.count}</h2>
    </div>
  );
}
