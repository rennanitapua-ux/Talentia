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
        <PolarGrid stroke="hsl(226 20% 15%)" strokeOpacity={0.4} />
        <PolarAngleAxis
          dataKey="competency"
          tick={{ fill: 'hsl(220 20% 75%)', fontSize: 11, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fill: 'hsl(220 14% 52%)', fontSize: 9 }}
          stroke="hsl(226 20% 15%)"
          strokeOpacity={0.3}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(226 28% 8%)',
            border: '1px solid hsl(226 20% 15%)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(value) => [`${value}/100`, 'Score']}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullCompetency || ''}
        />
        <Radar
          dataKey="score"
          stroke="hsl(217 91% 60%)"
          fill="hsl(217 91% 60%)"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 3, fill: 'hsl(217 91% 60%)' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}