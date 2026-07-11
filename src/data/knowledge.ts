export type KnowledgeSource = {
  id: string
  title: string
  publisher: string
  url: string
  kind: 'open_textbook' | 'university' | 'reference_lesson' | 'course_outline'
  license: string
  accessedAt: string
}

export type KnowledgeClaim = {
  statement: string
  sourceIds: string[]
  scope?: string
}

export type KnowledgeNode = {
  id: string
  title: string
  lessonIds: string[]
  claims: KnowledgeClaim[]
  status: 'researched' | 'reviewed'
  reviewedAt: string
}

export const knowledgeSources: KnowledgeSource[] = [
  {
    id: 'openstax-wave-properties',
    title: 'Wave Properties: Speed, Amplitude, Frequency, and Period',
    publisher: 'OpenStax',
    url: 'https://openstax.org/books/physics/pages/13-2-wave-properties-speed-amplitude-frequency-and-period',
    kind: 'open_textbook', license: 'CC BY 4.0', accessedAt: '2026-07-11',
  },
  {
    id: 'unsw-how-guitar-works',
    title: 'How does a guitar work?',
    publisher: 'University of New South Wales · Music Acoustics',
    url: 'https://www.phys.unsw.edu.au/~jw/guitar/guitarintro.html',
    kind: 'university', license: 'Reference use; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'fender-musical-notes',
    title: 'Musical Notes Made Easy',
    publisher: 'Fender',
    url: 'https://www.fender.com/articles/techniques/musical-notes-made-easy',
    kind: 'reference_lesson', license: 'Reference use; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'fender-playing-notes',
    title: 'How to Play Some Notes on Your Guitar',
    publisher: 'Fender Play',
    url: 'https://www.fender.com/articles/techniques/how-top-play-notes-on-guitar',
    kind: 'reference_lesson', license: 'Reference use; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'fender-standard-tuning',
    title: 'Standard Tuning: How EADGBE Came to Be',
    publisher: 'Fender',
    url: 'https://www.fender.com/articles/setup/standard-tuning-how-eadgbe-came-to-be',
    kind: 'reference_lesson', license: 'Reference use; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'musictheory-lessons',
    title: 'Theory Lessons',
    publisher: 'musictheory.net',
    url: 'https://www.musictheory.net/lessons',
    kind: 'reference_lesson', license: 'Free online reference; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'omt-rhythm-meter',
    title: 'Rhythm and Meter',
    publisher: 'Open Music Theory',
    url: 'https://viva.pressbooks.pub/openmusictheory/part/rhythm-and-meter/',
    kind: 'open_textbook', license: 'CC BY-SA 4.0', accessedAt: '2026-07-11',
  },
  {
    id: 'omt-simple-meter',
    title: 'Simple Meter and Time Signatures',
    publisher: 'Open Music Theory',
    url: 'https://viva.pressbooks.pub/openmusictheory/chapter/meter/',
    kind: 'open_textbook', license: 'CC BY-SA 4.0', accessedAt: '2026-07-11',
  },
  {
    id: 'omt-intervals',
    title: 'Intervals',
    publisher: 'Open Music Theory',
    url: 'https://viva.pressbooks.pub/openmusictheory/chapter/intervals/',
    kind: 'open_textbook', license: 'CC BY-SA 4.0', accessedAt: '2026-07-11',
  },
  {
    id: 'fender-interval',
    title: 'What is an interval?',
    publisher: 'Fender Tune',
    url: 'https://tune-support.fender.com/hc/en-us/articles/360003007812-What-is-an-interval',
    kind: 'reference_lesson', license: 'Reference use; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'omt-core',
    title: 'Open Music Theory · Fundamentals',
    publisher: 'Open Music Theory',
    url: 'https://viva.pressbooks.pub/openmusictheory/',
    kind: 'open_textbook', license: 'CC BY-SA 4.0', accessedAt: '2026-07-11',
  },
  {
    id: 'fender-major-scales',
    title: 'Learn About Major Scales on Guitar',
    publisher: 'Fender Play',
    url: 'https://www.fender.com/articles/scales/major-guitar-scales',
    kind: 'reference_lesson', license: 'Reference use; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'fender-minor-scales',
    title: 'Learn About Minor Scales on Guitar',
    publisher: 'Fender Play',
    url: 'https://www.fender.com/articles/scales/minor-guitar-scale',
    kind: 'reference_lesson', license: 'Reference use; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'fender-a-minor-pentatonic',
    title: 'How to Play the A Minor Pentatonic Scale',
    publisher: 'Fender Play',
    url: 'https://www.fender.com/articles/scales/a-minor-pentatonic-guitar-scale',
    kind: 'reference_lesson', license: 'Reference use; original text not reproduced', accessedAt: '2026-07-11',
  },
  {
    id: 'berklee-theory-101',
    title: 'Music Theory 101 · Course Description and Syllabus',
    publisher: 'Berklee Online',
    url: 'https://online.berklee.edu/courses/music-theory-101',
    kind: 'course_outline', license: 'Curriculum sequencing reference', accessedAt: '2026-07-11',
  },
  {
    id: 'berklee-guitar-handbook',
    title: 'Berklee Online Guitar Handbook',
    publisher: 'Berklee Online',
    url: 'https://assets.online.berklee.edu/handbooks/berklee-online-guitar-handbook.pdf',
    kind: 'course_outline', license: 'Reference use; original text and figures not reproduced', accessedAt: '2026-07-11',
  },
]

export const knowledgeNodes: KnowledgeNode[] = [
  {
    id: 'kb.sound.pitch', title: '振动、频率、音高、响度与音色', lessonIds: ['sound-basics'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '声音由振动产生；在基础模型中，频率越高，人耳感知的音高通常越高。', sourceIds: ['openstax-wave-properties', 'unsw-how-guitar-works'] },
      { statement: '振幅与响度相关，但音高和响度是不同的听觉维度。', sourceIds: ['openstax-wave-properties'] },
      { statement: '吉他弦的音高受有效弦长、张力和单位长度质量影响；按更高品位会缩短有效弦长并升高音高。', sourceIds: ['unsw-how-guitar-works'] },
    ],
  },
  {
    id: 'kb.pitch.note-system', title: '音名、半音、全音与八度', lessonIds: ['note-names', 'whole-half'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '西方常用音名以 A–G 七个字母循环，E–F 与 B–C 在自然音之间相隔半音。', sourceIds: ['fender-musical-notes', 'musictheory-lessons'] },
      { statement: '吉他在标准品格系统下，每升一品通常升高一个半音，两品构成一个全音。', sourceIds: ['fender-musical-notes', 'fender-playing-notes'] },
      { statement: '八度后的音级名称循环；在十二平均律中，一个八度划分为十二个半音。', sourceIds: ['fender-musical-notes', 'omt-core'] },
    ],
  },
  {
    id: 'kb.guitar.standard-tuning', title: '标准调弦与相邻弦关系', lessonIds: ['open-strings'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '六弦吉他标准调弦从低到高为 E–A–D–G–B–E。', sourceIds: ['fender-standard-tuning'] },
      { statement: '相邻弦多数为纯四度，G–B 之间例外为大三度；这一差异会造成跨弦指型的一品偏移。', sourceIds: ['fender-standard-tuning', 'berklee-guitar-handbook'] },
    ],
  },
  {
    id: 'kb.guitar.fretboard-map', title: '品格与指板音名推导', lessonIds: ['fretboard-map'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '每个品格代表一个半音，因此可从空弦音按品数逐步推导任意位置的音名。', sourceIds: ['fender-playing-notes', 'fender-musical-notes'] },
      { statement: '例如高音 E 弦一品为 F、二品为 F♯、三品为 G。', sourceIds: ['fender-playing-notes'] },
    ],
  },
  {
    id: 'kb.guitar.octaves', title: '十二品、八度与重复音', lessonIds: ['octave-shapes'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '频率加倍对应升高一个八度，同名音可出现在不同琴弦和音区。', sourceIds: ['unsw-how-guitar-works', 'omt-core'] },
      { statement: '十二品附近的有效弦长约为开放弦的一半，因此发出高八度音；实际乐器会有弦高补偿与音准校正。', sourceIds: ['unsw-how-guitar-works'] },
    ],
  },
  {
    id: 'kb.rhythm.pulse-tempo', title: '脉搏、速度与 BPM', lessonIds: ['pulse-bpm'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '拍是组织音乐时间的周期性参照，速度描述拍点出现的快慢。', sourceIds: ['omt-rhythm-meter', 'musictheory-lessons'] },
      { statement: 'BPM 表示每分钟拍数，因此每拍秒数可由 60 ÷ BPM 得到。', sourceIds: ['omt-rhythm-meter'] },
    ],
  },
  {
    id: 'kb.rhythm.meter', title: '拍号、小节与时值', lessonIds: ['meter-values'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '在单拍子中，拍号上方数字表示每小节拍数，下方数字表示作为一拍的音符单位。', sourceIds: ['omt-simple-meter', 'musictheory-lessons'] },
      { statement: '小节线把拍组分隔成小节；拍号看似分数，但不是数学分数。', sourceIds: ['omt-simple-meter'] },
    ],
  },
  {
    id: 'kb.rhythm.subdivision', title: '细分、休止与切分', lessonIds: ['subdivision'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '简单拍子的拍可等分为二，复合拍子的拍通常等分为三。', sourceIds: ['omt-rhythm-meter', 'musictheory-lessons'] },
      { statement: '切分通过强调通常较弱的拍或细分位置，改变听者感受到的重音结构。', sourceIds: ['omt-rhythm-meter'] },
    ],
  },
  {
    id: 'kb.interval.identity', title: '音程的度数与性质', lessonIds: ['interval-distance'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '音程描述两个音之间的距离；完整名称包含度数与性质。', sourceIds: ['omt-intervals', 'fender-interval'] },
      { statement: '度数按音名字母包含首尾计算，性质再由实际音高距离确定；C–E 为三度且相距四个半音，因此是大三度。', sourceIds: ['omt-intervals', 'fender-interval'] },
    ],
  },
  {
    id: 'kb.interval.third-fifth', title: '三度、五度与和弦色彩', lessonIds: ['thirds-fifths'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '大三度为四个半音，小三度为三个半音，纯五度为七个半音。', sourceIds: ['omt-intervals', 'fender-interval'] },
      { statement: '三和弦以根音、三音和五音为骨架，三音的高低决定常见大、小三和弦性质。', sourceIds: ['berklee-guitar-handbook'] },
    ],
  },
  {
    id: 'kb.interval.fretboard', title: '音程关系在指板上的几何映射', lessonIds: ['interval-fretboard'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '品格的等半音排列使相对品差可整体移动，同时保持内部音程关系。', sourceIds: ['fender-playing-notes', 'berklee-guitar-handbook'] },
      { statement: '跨越 G–B 弦时，因标准调弦的唯一大三度关系，常见指型需要补偿一品。', sourceIds: ['fender-standard-tuning'] },
    ],
  },
  {
    id: 'kb.scale.major', title: '大调音阶的构造与拼写', lessonIds: ['major-scale'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '大调音阶包含七个不同级数，按全–全–半–全–全–全–半构造。', sourceIds: ['fender-major-scales', 'musictheory-lessons', 'omt-core'] },
      { statement: '正确拼写应让七个字母各出现一次，因此 F 大调写 B♭ 而非 A♯。', sourceIds: ['omt-core', 'musictheory-lessons'] },
    ],
  },
  {
    id: 'kb.scale.minor', title: '自然小调与关系大小调', lessonIds: ['minor-scale'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '自然小调按全–半–全–全–半–全–全构造。', sourceIds: ['fender-minor-scales', 'musictheory-lessons', 'omt-core'] },
      { statement: '关系大小调共享调号与音符集合，但主音和各级功能不同；A 小调与 C 大调是典型关系大小调。', sourceIds: ['fender-minor-scales', 'omt-core'] },
    ],
  },
  {
    id: 'kb.scale.pentatonic', title: '小调五声音阶的音级与指板位置', lessonIds: ['pentatonic'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: 'A 小调五声音阶包含 A、C、D、E、G，对应 1、♭3、4、5、♭7。', sourceIds: ['fender-a-minor-pentatonic'] },
      { statement: '同一组五个音会在不同音区重复，位置图应与根音和音级功能一起学习，而不只是记手型。', sourceIds: ['fender-a-minor-pentatonic', 'berklee-guitar-handbook'] },
    ],
  },
  {
    id: 'kb.sequence.mvp', title: 'MVP 课程顺序依据', lessonIds: ['sound-basics', 'note-names', 'whole-half', 'open-strings', 'fretboard-map', 'octave-shapes', 'pulse-bpm', 'meter-values', 'subdivision', 'interval-distance', 'thirds-fifths', 'interval-fretboard', 'major-scale', 'minor-scale', 'pentatonic'], status: 'reviewed', reviewedAt: '2026-07-11',
    claims: [
      { statement: '课程先建立节奏、音高与记谱，再进入音阶、音程、三和弦及应用，符合主流基础乐理课程的依赖顺序。', sourceIds: ['berklee-theory-101', 'musictheory-lessons'] },
      { statement: '本产品在通用乐理顺序上增加标准调弦、指板推导和可移动形状，以建立吉他迁移能力。', sourceIds: ['berklee-guitar-handbook', 'fender-standard-tuning'] },
    ],
  },
]

export function getKnowledgeForLesson(lessonId: string) {
  const nodes = knowledgeNodes.filter((node) => node.lessonIds.includes(lessonId))
  const sourceIds = [...new Set(nodes.flatMap((node) => node.claims.flatMap((claim) => claim.sourceIds)))]
  return { nodes, sources: sourceIds.map((id) => knowledgeSources.find((source) => source.id === id)).filter((source): source is KnowledgeSource => Boolean(source)) }
}
