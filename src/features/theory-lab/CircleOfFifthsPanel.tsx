import { useState } from 'react'
import { getScaleNotes } from '../../theory'

export function CircleOfFifthsPanel() {
  const outer = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'D♭', 'A♭', 'E♭', 'B♭', 'F']
  const inner = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm']
  const [selected, setSelected] = useState('C')

  return (
    <div className="circle-wrap">
      <div className="circle-of-fifths">
        {outer.map((key, i) => {
          const angle = i * 30 - 90
          return (
            <button
              className={selected === key ? 'active' : ''}
              onClick={() => setSelected(key)}
              key={key}
              style={{ transform: `rotate(${angle}deg) translate(150px) rotate(${-angle}deg)` }}
            >
              <b>{key}</b>
              <small>{inner[i]}</small>
            </button>
          )
        })}
        <div className="circle-center">
          <span>当前调</span>
          <b>{selected}</b>
          <small>{getScaleNotes(selected, 'major').join(' · ')}</small>
        </div>
      </div>
    </div>
  )
}
