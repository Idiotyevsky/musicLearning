import type { Exercise, ExerciseResult } from '../../data/catalog'
import InlineQuiz from '../../components/InlineQuiz'
import { FretboardClickExercise } from './FretboardClickExercise'
import { IntervalInputExercise } from './IntervalInputExercise'
import { RomanNumeralInputExercise } from './RomanNumeralInputExercise'

type Props = {
  lessonId: string
  exercise: Exercise
  onResult: (result: ExerciseResult) => void
  onNext: () => void
}

export function ExerciseRenderer({ lessonId, exercise, onResult, onNext }: Props) {
  switch (exercise.type) {
    case 'multiple_choice':
      return <InlineQuiz lessonId={lessonId} exercises={[exercise]} onResult={onResult} />

    case 'fretboard_click':
      return <FretboardClickExercise exercise={exercise} onResult={(correct) => {
        onResult({ exerciseId: exercise.id, lessonId, correct })
        onNext()
      }} />

    case 'interval_input':
      return <IntervalInputExercise exercise={exercise} onResult={(correct) => {
        onResult({ exerciseId: exercise.id, lessonId, correct })
        onNext()
      }} />

    case 'roman_numeral_input':
      return <RomanNumeralInputExercise exercise={exercise} onResult={(correct) => {
        onResult({ exerciseId: exercise.id, lessonId, correct })
        onNext()
      }} />

    default:
      return <div className="exercise-card"><p className="muted">此题型暂不支持。</p></div>
  }
}
