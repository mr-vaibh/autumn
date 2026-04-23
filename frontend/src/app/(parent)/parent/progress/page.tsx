"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const monthlyProgress = [
  { month: "Nov", speechScore: 2.8, otScore: 2.5, sensoryScore: 3.0 },
  { month: "Dec", speechScore: 3.0, otScore: 2.8, sensoryScore: 3.2 },
  { month: "Jan", speechScore: 3.2, otScore: 3.0, sensoryScore: 3.4 },
  { month: "Feb", speechScore: 3.5, otScore: 3.2, sensoryScore: 3.6 },
  { month: "Mar", speechScore: 3.7, otScore: 3.4, sensoryScore: 3.8 },
  { month: "Apr", speechScore: 4.0, otScore: 3.7, sensoryScore: 4.2 },
  { month: "May", speechScore: 4.2, otScore: 3.9, sensoryScore: 4.5 },
];

const skillsData = [
  { skill: "Communication", current: 72, target: 90 },
  { skill: "Social Skills", current: 58, target: 80 },
  { skill: "Motor Skills", current: 68, target: 85 },
  { skill: "Self-Care", current: 75, target: 90 },
  { skill: "Sensory Processing", current: 80, target: 95 },
  { skill: "Academic Skills", current: 62, target: 80 },
];

const milestones = [
  { date: "May 2024", milestone: "Named 20 objects correctly in speech therapy", type: "speech" },
  { date: "Apr 2024", milestone: "Completed full 45-min OT session without breaks", type: "ot" },
  { date: "Mar 2024", milestone: "Started using 2-word combinations spontaneously", type: "speech" },
  { date: "Feb 2024", milestone: "Improved scissor grip - can now cut along straight lines", type: "ot" },
  { date: "Jan 2024", milestone: "Tolerates various textures in sensory bin", type: "sensory" },
];

const typeColors: Record<string, string> = {
  speech: "bg-purple-100 text-purple-700 border-purple-200",
  ot: "bg-blue-100 text-blue-700 border-blue-200",
  sensory: "bg-green-100 text-green-700 border-green-200",
};

export default function ParentProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Progress Tracking</h1>
        <p className="text-sm text-gray-500 mt-0.5">Arjun Kumar&apos;s therapy progress overview</p>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { label: "Overall Progress", value: "4.2/5", sub: "This month" },
            { label: "Sessions Completed", value: "18/22", sub: "May 2024" },
            { label: "Attendance Rate", value: "87%", sub: "This month" },
          ].map((stat, idx) => (
            <div key={idx}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-purple-200 text-sm mt-1">{stat.label}</p>
              <p className="text-purple-300 text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Progress */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Therapy Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="speechScore" stroke="#7C3AED" strokeWidth={2} name="Speech" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="otScore" stroke="#2563EB" strokeWidth={2} name="OT" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="sensoryScore" stroke="#059669" strokeWidth={2} name="Sensory" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Skills Development</h3>
          <div className="space-y-4">
            {skillsData.map((skill) => (
              <div key={skill.skill}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">{skill.skill}</span>
                  <span className="text-gray-500">{skill.current}% / {skill.target}%</span>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="absolute left-0 top-0 h-2.5 bg-purple-500 rounded-full transition-all"
                    style={{ width: `${skill.current}%` }}
                  ></div>
                  <div
                    className="absolute top-0 h-2.5 w-0.5 bg-gray-400"
                    style={{ left: `${skill.target}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Bar shows current level. Marker shows target.</p>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Achievement Milestones</h3>
        <div className="space-y-3">
          {milestones.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">{item.milestone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
