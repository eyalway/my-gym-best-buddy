import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'אימון 1', value: 30 },
  { name: 'אימון 2', value: 40 },
  { name: 'אימון 3', value: 35 },
];

const TestChart = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">בדיקת גרף</h1>
      <div className="border border-red-500 w-full max-w-sm mx-auto overflow-hidden">
        <p className="text-sm mb-2">גרף צריך להיות בתוך הקו האדום</p>
        <div style={{ width: '100%', height: '200px', maxWidth: '100%', overflow: 'hidden' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Line type="monotone" dataKey="value" stroke="#ff7300" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TestChart;