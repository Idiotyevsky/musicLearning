import type { Exercise } from '../../data/catalog'
import InlineQuiz from '../../components/InlineQuiz'
import { FretboardClickExercise } from './FretboardClickExercise'
import { IntervalInputExercise } from './IntervalInputExercise'
import { RomanNumeralInputExercise } from './RomanNumeralInputExercise'

type Props = {
  lessonId: string
  exercises: Exercise[]
  onNext: () => void
}

function UnsupportedExercise() {
  return <div className="exercise-card"><p className="muted">此题型暂不支持。</p></div>
}

export function ExerciseRenderer({ lessonId, exercises, onNext }: Props) {
  const exercise = exercises[0]
  if (!exercise) return null

  const handleResult = () => onNext()

  switch (exercise.type) {
    case 'multiple_choice':
      return <InlineQuiz lessonId={lessonId} exercises={exercises} />

    case 'fretboard_click':
      return <FretboardClickExercise exercise={exercise} onResult={handleResult} />

    case 'interval_input':
      return <IntervalInputExercise exercise={exercise} onResult={handleResult} />

    case 'roman_numeral_input':
      return <RomanNumeralInputExercise exercise={exercise} onResult={handleResult} />

    default:
      return <UnsupportedExercise />
  }
}
