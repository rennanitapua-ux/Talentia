import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getScoreColor } from '@/lib/skillScoring';

export default function SkillGraph({ scores, competencies, height = 320 }) {
  const data = (competencies || Object.keys(scores || {})).map(c => ({
    competency: c.length > 18 ? c.substring(0, 16) + '…' : c,
    fullCompetency: c,
    score: (scores || {})[c] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke="#334155" strokeOpacity={0.4} />
        <PolarAngleAxis
          dataKey="competency"
          tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fill: '#64748b', fontSize: 9 }}
          stroke="#334155"
          strokeOpacity={0.3}
        />
        <Tooltip
          contentStyle={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(value) => [`${value}/100`, 'Score']}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullCompetency || ''}
        />
        <Radar
          dataKey="score"
          stroke="#22d3ee"
          fill="#22d3ee"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 3, fill: '#22d3ee' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}