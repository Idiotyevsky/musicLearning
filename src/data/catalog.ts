export type LessonSection = { type: 'explanation' | 'example' | 'fretboard' | 'exercise'; title: string; content: string }

export type AudioDemo = {
  id: string; title: string; mode: 'single' | 'sequential' | 'simultaneous' | 'rhythm'
  notes?: string[]; intervals?: string[]; tempo?: number; description?: string
}

export type FretboardDemo = {
  root?: string; highlightedNotes?: string[]; displayMode: 'note' | 'degree' | 'interval'
  description?: string
}

export type LessonInteraction = { audioDemos: AudioDemo[]; fretboardDemos: FretboardDemo[] }
export type ExerciseType = 'multiple_choice' | 'fretboard_click' | 'interval_input' | 'roman_numeral_input'

export type ExerciseResult = { exerciseId: string; lessonId: string; correct: boolean }

export type QuizSeed = { prompt: string; options: string[]; answer: number; explanation: string }

export type Exercise = {
  id: string
  lessonId: string
  type: ExerciseType
  difficulty: number
  prompt: string
  options: string[]
  answer: number
  explanation: string
  /** 指板点击题：目标音名 */
  targetNote?: string
  /** 指板点击题：参考调 */
  targetContext?: string
  /** 音程输入题：标准答案（如"大三度"） */
  intervalAnswer?: string
  /** 罗马数字输入题：标准答案（如"vi"） */
  romanAnswer?: string
}

export type Lesson = {
  id: string; moduleId: string; slug: string; title: string; summary: string; minutes: number;
  objective: string; prerequisite?: string; coreQuestion: string; formula: string; status: 'published';
  sections: LessonSection[]; mistakes: string[]; quiz: QuizSeed[]; interaction?: LessonInteraction;
}
export type CourseModule = { id: string; index: number; title: string; subtitle: string; color: string }

export const modules: CourseModule[] = [
  { id: 'foundation', index: 0, title: '音乐基础认知', subtitle: '先建立声音、音名与半音的共同语言', color: '#d88c48' },
  { id: 'fretboard', index: 1, title: '吉他与指板', subtitle: '把十二个音真正放回六根琴弦', color: '#2f746a' },
  { id: 'rhythm', index: 2, title: '节拍与节奏', subtitle: '让拍点、时值与扫弦动作对齐', color: '#5e6f9d' },
  { id: 'interval', index: 3, title: '音程基础', subtitle: '听懂两个音之间的距离与色彩', color: '#9a5f72' },
  { id: 'scale', index: 4, title: '音阶与调性', subtitle: '从音程公式推导音阶，而不是死背框型', color: '#886d3f' },
]

const common = (explanation: string, example: string): LessonSection[] => [
  { type: 'explanation', title: '先抓住规律', content: explanation },
  { type: 'example', title: '放到吉他上', content: example },
  { type: 'fretboard', title: '在指板上验证', content: '观察高亮音在不同琴弦上的重复位置。点击任意音点可以听音，并比较十二品前后的八度关系。' },
  { type: 'exercise', title: '马上检验', content: '完成本课练习，答案会解释推导过程，并自动记录到你的掌握度。' },
]

export const lessons: Lesson[] = [
  {
    id: 'sound-basics', moduleId: 'foundation', slug: 'sound-basics', title: '声音为什么有高低？', minutes: 8,
    summary: '频率决定音高，振幅主要影响响度，波形影响音色。', objective: '能区分音高、响度与音色',
    coreQuestion: '琴弦变短后，声音为什么会变高？', formula: '频率 ↑ → 音高 ↑', status: 'published',
    sections: common('声音来自振动。单位时间内振动次数越多，频率越高，人耳感知到的音高也越高。', '按住品格让有效弦长缩短，琴弦振动更快，所以每升一品，音高上升一个半音。'),
    mistakes: ['把“更响”误认为“更高”', '认为粗弦一定比细弦更响'],
    quiz: [
      { prompt: '直接决定音高的物理量是什么？', options: ['频率', '振幅', '时长', '音量旋钮'], answer: 0, explanation: '频率表示每秒振动次数，它直接决定人耳感知的音高。' },
      { prompt: '同一根弦按得更靠近琴桥，通常会怎样？', options: ['音高升高', '音高降低', '音名不变', '只改变响度'], answer: 0, explanation: '有效弦长变短，频率随之升高。' },
      { prompt: '两把吉他弹同一个 A，仍能听出差别，主要因为？', options: ['音色不同', '拍号不同', '音名不同', '级数不同'], answer: 0, explanation: '乐器结构与泛音分布造成不同音色。' },
      { prompt: '振幅主要对应听觉中的什么？', options: ['响度', '音高', '调号', '速度'], answer: 0, explanation: '在其他条件相同时，振幅越大通常听起来越响。' },
    ],
  },
  {
    id: 'note-names', moduleId: 'foundation', slug: 'note-names', title: '七个音名与十二个音', minutes: 10,
    summary: 'C D E F G A B 是七个基本音名，升降音补足十二个半音位置。', objective: '按顺序说出十二个音', prerequisite: 'sound-basics',
    coreQuestion: '为什么七个字母能描述十二个音？', formula: 'C–C♯–D–D♯–E–F–F♯–G–G♯–A–A♯–B', status: 'published',
    sections: common('自然音使用 C 到 B 七个字母。相邻自然音通常相差全音，但 E–F 与 B–C 天然只差半音。', '六弦空弦是 E，所以一品直接是 F；五弦空弦是 A，一品则是 A♯/B♭。'),
    mistakes: ['在 E 与 F 之间多放一个黑键', '误以为升号总是黑键'],
    quiz: [
      { prompt: '哪一对自然音之间相差半音？', options: ['E–F', 'C–D', 'F–G', 'A–B'], answer: 0, explanation: '自然音中 E–F 与 B–C 是两对半音。' },
      { prompt: 'C 向上一个半音是什么？', options: ['C♯', 'D', 'B', 'D♭'], answer: 0, explanation: '升号表示升高一个半音。C♯ 与 D♭ 同音异名。' },
      { prompt: '一个八度包含多少个半音？', options: ['12', '7', '8', '6'], answer: 0, explanation: '十二平均律把八度等分为 12 个半音。' },
      { prompt: 'B 向上一个半音是什么？', options: ['C', 'B♯♯', 'D♭', 'A♯'], answer: 0, explanation: 'B 与 C 天然相邻，中间没有其他音级。' },
    ],
  },
  {
    id: 'whole-half', moduleId: 'foundation', slug: 'whole-half', title: '半音、全音与八度', minutes: 9,
    summary: '半音是十二平均律的最小距离；两个半音组成一个全音。', objective: '能在指板上移动半音、全音与八度', prerequisite: 'note-names',
    coreQuestion: '移动几品等于一个全音？', formula: '1 品 = 半音；2 品 = 全音；12 品 = 八度', status: 'published',
    sections: common('距离用半音计数比用音名字母更直接。八度相差 12 个半音，音名重新循环。', '同一根弦向琴桥移动一品升半音，移动两品升全音，移动十二品得到高八度同名音。'),
    mistakes: ['数品柱而不是数品格', '把八个自然音名误当作八个半音'],
    quiz: [
      { prompt: '吉他同一根弦移动两品，音高变化？', options: ['一个全音', '一个半音', '一个八度', '纯五度'], answer: 0, explanation: '一品一个半音，两品即两个半音，也就是一个全音。' },
      { prompt: '从 G 到 A 有几个半音？', options: ['2', '1', '3', '12'], answer: 0, explanation: 'G–G♯–A，共两个半音。' },
      { prompt: '六弦空弦 E 的高八度在哪一品？', options: ['12 品', '7 品', '5 品', '10 品'], answer: 0, explanation: '同弦上 12 品对应一个八度。' },
      { prompt: '三个半音等于？', options: ['小三度', '大三度', '纯四度', '全音'], answer: 0, explanation: '三个半音构成小三度。' },
    ],
  },
  {
    id: 'open-strings', moduleId: 'fretboard', slug: 'open-strings', title: '六根空弦与标准调弦', minutes: 10,
    summary: '从低音六弦到高音一弦：E A D G B E。', objective: '记住标准调弦并能定位空弦音', prerequisite: 'whole-half',
    coreQuestion: '为什么一弦和六弦都是 E？', formula: '6→1：E A D G B E', status: 'published',
    sections: common('标准调弦让大多数相邻弦相差纯四度，三弦 G 到二弦 B 例外，相差大三度。', '一弦与六弦虽同名，却相差两个八度。这让许多上下对称的和弦指型成为可能。'),
    mistakes: ['把顺序从一弦和六弦混淆', '忽略 G–B 弦之间的特殊关系'],
    quiz: [
      { prompt: '从六弦到一弦的标准调弦是？', options: ['E A D G B E', 'E B G D A E', 'D A D G A D', 'E A C G B E'], answer: 0, explanation: '从最粗六弦到最细一弦依次是 E A D G B E。' },
      { prompt: '哪一对相邻弦不是纯四度关系？', options: ['三弦与二弦', '六弦与五弦', '五弦与四弦', '二弦与一弦'], answer: 0, explanation: 'G 到 B 为大三度，这是指型发生偏移的原因。' },
      { prompt: '最细的一弦空弦音是？', options: ['E', 'A', 'B', 'G'], answer: 0, explanation: '一弦是高音 E。' },
      { prompt: '四弦空弦音是？', options: ['D', 'G', 'A', 'B'], answer: 0, explanation: '标准调弦的四弦为 D。' },
    ],
  },
  {
    id: 'fretboard-map', moduleId: 'fretboard', slug: 'fretboard-map', title: '指板上的音如何排列', minutes: 12,
    summary: '每一品升高半音，十二品后音名循环。', objective: '从空弦推算任意品格音名', prerequisite: 'open-strings',
    coreQuestion: '不背整张图，怎样找到任意音？', formula: '目标音 = 空弦音 + 品数（半音）', status: 'published',
    sections: common('先记空弦音与十二音顺序，就能用加法推导每个品格。重点锚点是 0、5、7、12 品。', '例如五弦空弦 A，三品向上三个半音得到 C；六弦八品同样是 C。'),
    mistakes: ['跨过 E–F 或 B–C 时多算一品', '只背图形，不说出音名'],
    quiz: [
      { prompt: '五弦三品是什么音？', options: ['C', 'B', 'C♯', 'D'], answer: 0, explanation: 'A 向上三半音：A♯、B、C。' },
      { prompt: '六弦八品是什么音？', options: ['C', 'B', 'D', 'G'], answer: 0, explanation: 'E 向上八半音得到 C。' },
      { prompt: '二弦一品是什么音？', options: ['C', 'B♭', 'C♯', 'D'], answer: 0, explanation: '二弦空弦 B，向上一品就是 C。' },
      { prompt: '三弦七品是什么音？', options: ['D', 'C', 'E', 'B'], answer: 0, explanation: 'G 向上七半音得到 D。' },
    ],
  },
  {
    id: 'octave-shapes', moduleId: 'fretboard', slug: 'octave-shapes', title: '八度与重复音', minutes: 11,
    summary: '利用固定八度指型，可以快速连接不同区域的同名音。', objective: '识别三种常用八度形状', prerequisite: 'fretboard-map',
    coreQuestion: '怎样从一个根音迅速找到另一个根音？', formula: '八度 = 12 半音', status: 'published',
    sections: common('同名音可以位于不同琴弦和音区。八度形状是一张可移动的空间地图。', '六弦根音向高音方向跨两弦、右移两品可找到八度；跨越 G–B 弦时要额外右移一品。'),
    mistakes: ['跨 G–B 弦仍机械移动两品', '把同音与同音高混为一谈'],
    quiz: [
      { prompt: '八度包含几个半音？', options: ['12', '8', '7', '5'], answer: 0, explanation: '十二平均律中八度恰好跨越 12 个半音。' },
      { prompt: '八度音之间什么相同？', options: ['音级名称', '绝对频率', '响度', '指法'], answer: 0, explanation: '八度音共享音级名称，但频率相差一倍。' },
      { prompt: '12 品泛音通常对应空弦的？', options: ['高八度', '纯五度', '低八度', '大三度'], answer: 0, explanation: '12 品处将弦等分为两半，产生高八度。' },
      { prompt: '使用八度形状最主要的作用是？', options: ['连接同名根音', '改变拍号', '调整音量', '判断速度'], answer: 0, explanation: '八度形状帮助在多个区域快速定位同名音。' },
    ],
  },
  {
    id: 'pulse-bpm', moduleId: 'rhythm', slug: 'pulse-bpm', title: '拍点与 BPM', minutes: 8,
    summary: '拍点是稳定脉搏，BPM 表示每分钟拍数。', objective: '能跟随节拍器稳定数拍', prerequisite: 'sound-basics',
    coreQuestion: '速度 60 BPM 意味着什么？', formula: '每拍秒数 = 60 ÷ BPM', status: 'published',
    sections: common('节拍不是声音本身，而是组织时间的网格。BPM 只描述网格快慢，不直接说明每拍弹几下。', '60 BPM 时每拍一秒；120 BPM 时每拍半秒。先用脚打拍，再把扫弦动作放进去。'),
    mistakes: ['把 BPM 当作拍号', '加快时不自觉缩短所有休止'],
    quiz: [
      { prompt: '60 BPM 时一拍多长？', options: ['1 秒', '0.5 秒', '2 秒', '60 秒'], answer: 0, explanation: '60 秒除以每分钟 60 拍，每拍正好 1 秒。' },
      { prompt: '120 BPM 时一拍多长？', options: ['0.5 秒', '1 秒', '2 秒', '0.25 秒'], answer: 0, explanation: '60 ÷ 120 = 0.5 秒。' },
      { prompt: 'BPM 描述的是？', options: ['拍点速度', '调性', '和弦性质', '音色'], answer: 0, explanation: 'BPM 是 beats per minute，即每分钟拍数。' },
      { prompt: '练习新动作时节拍器应如何设置？', options: ['从可控慢速开始', '直接原速', '越快越好', '不用数拍'], answer: 0, explanation: '慢速稳定能暴露动作与拍点的偏差。' },
    ],
  },
  {
    id: 'meter-values', moduleId: 'rhythm', slug: 'meter-values', title: '拍号与音符时值', minutes: 12,
    summary: '拍号定义小节的组织方式，音符时值定义声音占据的拍数。', objective: '读懂 4/4、3/4 与 6/8 的基础划分', prerequisite: 'pulse-bpm',
    coreQuestion: '4/4 拍上、下两个 4 各表示什么？', formula: '上方 = 每小节拍数；下方 = 一拍的基准时值', status: 'published',
    sections: common('4/4 每小节四个四分音符拍。3/4 常呈现强–弱–弱；6/8 通常按两个大拍感受，每拍分成三份。', '扫弦先说出“1 & 2 & 3 & 4 &”，再让下扫落在数字，上扫落在 &。'),
    mistakes: ['把 6/8 简单当成更快的 3/4', '时值相加没有填满小节'],
    quiz: [
      { prompt: '4/4 拍每小节有几个四分音符拍？', options: ['4', '3', '6', '8'], answer: 0, explanation: '上面的 4 表示每小节四拍，下面的 4 表示以四分音符为一拍。' },
      { prompt: '一个二分音符等于几个四分音符？', options: ['2', '4', '1', '8'], answer: 0, explanation: '二分音符占两拍（以四分音符为一拍时）。' },
      { prompt: '6/8 拍常被感受成几个大拍？', options: ['2', '6', '3', '4'], answer: 0, explanation: '6/8 常按两个附点四分音符的大拍组织，每拍三等分。' },
      { prompt: '3/4 拍常见的重音结构是？', options: ['强弱弱', '强弱强弱', '六个等强拍', '弱强强'], answer: 0, explanation: '三拍子的基本律动通常是第一拍强，后两拍弱。' },
    ],
  },
  {
    id: 'subdivision', moduleId: 'rhythm', slug: 'subdivision', title: '八分音符与节拍细分', minutes: 10,
    summary: '把一拍等分为更小网格，是稳定扫弦与切分的基础。', objective: '用口令与动作完成八分、十六分细分', prerequisite: 'meter-values',
    coreQuestion: '为什么休止时右手仍应保持运动？', formula: '一拍：1 &；十六分：1 e & a', status: 'published',
    sections: common('细分是把拍点之间的时间平均切开。动作轨迹持续，某些位置不触弦，就能保持内部时钟稳定。', '八分音符常用下–上连续运动。遇到休止只让拨片掠过，不要停住整只手。'),
    mistakes: ['遇到休止就停止摆动', '只跟音符、不感受主拍'],
    quiz: [
      { prompt: '八分音符细分一拍通常数作？', options: ['1 &', '1 2 3', '1 e & a &', '只数 1'], answer: 0, explanation: '一拍平均分两份，常数作数字与 &。' },
      { prompt: '十六分音符把一拍分成几份？', options: ['4', '2', '3', '8'], answer: 0, explanation: '十六分细分常数作 1 e & a，共四个位置。' },
      { prompt: '扫弦休止时保持手部轨迹有助于？', options: ['维持时间网格', '改变调性', '降低音高', '增加延音'], answer: 0, explanation: '持续动作保留细分位置，节奏更不易漂移。' },
      { prompt: '切分最常见的效果是？', options: ['强调弱拍或弱位', '改变音名', '降低 BPM', '自动转调'], answer: 0, explanation: '切分通过强调通常较弱的位置制造推进感。' },
    ],
  },
  {
    id: 'interval-distance', moduleId: 'interval', slug: 'interval-distance', title: '音程：两个音的距离', minutes: 11,
    summary: '音程同时包含字母度数与半音距离。', objective: '能用半音数识别一到八度内常见音程', prerequisite: 'whole-half',
    coreQuestion: 'C 到 E 为什么是大三度而不是“四个半音”？', formula: 'C→E：三度 + 4 半音 = 大三度', status: 'published',
    sections: common('半音数告诉我们实际距离，字母数决定度数。两者结合才能得到完整音程名称。', '同一根弦上相差 3 品是小三度，4 品是大三度，5 品是纯四度，7 品是纯五度。'),
    mistakes: ['起点也作为一个半音来数', '只数品数，不数音名字母'],
    quiz: [
      { prompt: 'C 到 E 是什么音程？', options: ['大三度', '小三度', '纯四度', '大二度'], answer: 0, explanation: '字母跨 C-D-E 三度，实际距离 4 半音，因此是大三度。' },
      { prompt: '三个半音构成？', options: ['小三度', '大三度', '纯四度', '小二度'], answer: 0, explanation: '小三度固定为 3 个半音。' },
      { prompt: '七个半音构成？', options: ['纯五度', '增四度', '小六度', '大六度'], answer: 0, explanation: '纯五度的半音距离为 7。' },
      { prompt: 'C 到 F 的字母度数是？', options: ['四度', '三度', '五度', '六度'], answer: 0, explanation: '包含 C-D-E-F 四个字母位置，因此是四度。' },
    ],
  },
  {
    id: 'thirds-fifths', moduleId: 'interval', slug: 'thirds-fifths', title: '三度与五度的声音骨架', minutes: 12,
    summary: '三度决定大小色彩，五度提供稳定支撑。', objective: '区分大小三度并听辨纯五度', prerequisite: 'interval-distance',
    coreQuestion: '为什么只改变三音，就能让和弦从明亮变暗？', formula: '大三度 4；小三度 3；纯五度 7（半音）', status: 'published',
    sections: common('根音上方的大三度常呈现明亮色彩，小三度更内敛。纯五度因泛音关系稳定，是强力和弦的核心。', 'C–E 是大三度，C–E♭ 是小三度，C–G 是纯五度。组合后分别构成大、小三和弦骨架。'),
    mistakes: ['把“大小”理解成音量', '认为强力和弦已经包含大小调性质'],
    quiz: [
      { prompt: '决定大、小三和弦主要色彩的是？', options: ['三音', '五音', '根音音量', '扫弦方向'], answer: 0, explanation: '大三音与小三音的一个半音差，决定大/小性质。' },
      { prompt: 'C 到 G 是？', options: ['纯五度', '大五度', '小五度', '纯四度'], answer: 0, explanation: '五度类的稳定形式称为纯五度，共 7 半音。' },
      { prompt: '强力和弦通常包含？', options: ['根音与五音', '根音与三音', '三音与七音', '只有根音'], answer: 0, explanation: 'Power chord 多由 1 与 5（及八度）组成，未定义大小性质。' },
      { prompt: 'E♭ 比 E 低几个半音？', options: ['1', '2', '3', '12'], answer: 0, explanation: '一个降号把音降低一个半音。' },
    ],
  },
  {
    id: 'interval-fretboard', moduleId: 'interval', slug: 'interval-fretboard', title: '把音程形状铺在指板上', minutes: 13,
    summary: '指型是音程关系的几何投影，知道根音才能读懂形状。', objective: '从根音解释常用音程形状', prerequisite: 'thirds-fifths',
    coreQuestion: '同一个指型为什么可以整体移动？', formula: '相对品差不变 → 音程不变', status: 'published',
    sections: common('指型可以移动，是因为十二平均律在每个品格上保持相同的半音关系。形状的意义来自音程，不来自绝对位置。', '先标根音，再找 3、5、♭7 等音程。跨过二弦与三弦时，几何位置会因调弦差异发生一品偏移。'),
    mistakes: ['移动图形时忘记根音已经改变', '把视觉距离直接当作音程度数'],
    quiz: [
      { prompt: '可移动指型成立的关键是？', options: ['品格保持等半音关系', '每根弦音名相同', '所有弦等粗', '只在 C 调使用'], answer: 0, explanation: '每品固定一个半音，使相对品差在移动后仍代表相同音程。' },
      { prompt: '分析指型时第一步最好是？', options: ['定位根音', '提高速度', '记颜色', '换调弦'], answer: 0, explanation: '根音是所有级数和音程标签的参照点。' },
      { prompt: '跨 G–B 弦图形常偏移一品，因为？', options: ['两弦相差大三度', '琴颈弯曲', 'B 音更高', '品格不均匀'], answer: 0, explanation: '其他相邻弦多为纯四度，G–B 仅为大三度。' },
      { prompt: '整体上移两品后，原指型音程关系？', options: ['保持不变', '都增大二度', '变成八度', '无法判断'], answer: 0, explanation: '绝对音高整体升全音，但内部相对音程不变。' },
    ],
  },
  {
    id: 'major-scale', moduleId: 'scale', slug: 'major-scale', title: '从公式生成大调音阶', minutes: 14,
    summary: '大调音阶由“全全半全全全半”构成。', objective: '从任意主音生成大调音阶', prerequisite: 'interval-distance',
    coreQuestion: '为什么 F 大调必须写 B♭，而不写 A♯？', formula: 'W–W–H–W–W–W–H', status: 'published',
    sections: common('从主音出发按 2、2、1、2、2、2、1 个半音前进，同时确保七个音名字母各出现一次。', 'C 大调无需升降号；G 大调升 F；F 大调降 B。正确拼写能保留每个音阶级数。'),
    mistakes: ['只用升号拼写所有调', '忘记音阶最后还要回到高八度主音'],
    quiz: [
      { prompt: '大调音阶的音程结构是？', options: ['全全半全全全半', '全半全全半全全', '全半全全半全半', '半全全半全全全'], answer: 0, explanation: '大调固定结构为 W-W-H-W-W-W-H。' },
      { prompt: 'F 大调中哪个音需要降号？', options: ['B♭', 'E♭', 'F♭', 'A♭'], answer: 0, explanation: 'F 大调为 F G A B♭ C D E。' },
      { prompt: 'G 大调的第七级是？', options: ['F♯', 'F', 'G♭', 'E'], answer: 0, explanation: 'G 大调为了保持导音到主音的半音关系，需要升 F。' },
      { prompt: '大调音阶有几个不同级数？', options: ['7', '12', '8', '5'], answer: 0, explanation: '高八度主音是第一级的重复，因此有七个不同级数。' },
    ],
  },
  {
    id: 'minor-scale', moduleId: 'scale', slug: 'minor-scale', title: '自然小调与关系大小调', minutes: 13,
    summary: '自然小调公式为全半全全半全全；它与关系大调共享音符。', objective: '生成自然小调并找到关系大调', prerequisite: 'major-scale',
    coreQuestion: '为什么 A 小调与 C 大调音符完全相同，听感却不同？', formula: 'W–H–W–W–H–W–W', status: 'published',
    sections: common('共享音符不等于共享中心。A 小调把 A 当作稳定归宿，级数关系因此全部重排。', '弹同一组白键音，若旋律与和声回到 C，会形成 C 大调；若回到 A，则形成 A 小调。'),
    mistakes: ['认为相同音符必然是同一个调', '把关系大小调误作同主音大小调'],
    quiz: [
      { prompt: 'C 大调的关系小调是？', options: ['A 小调', 'C 小调', 'E 小调', 'D 小调'], answer: 0, explanation: '大调第六级作为主音可形成关系自然小调。' },
      { prompt: 'A 自然小调有哪些升降号？', options: ['没有', 'F♯', 'B♭', 'G♯'], answer: 0, explanation: 'A B C D E F G，全为自然音。' },
      { prompt: '关系大小调共享什么？', options: ['音符集合', '主音', '和弦功能编号', '听觉中心'], answer: 0, explanation: '两者共享调号与音符集合，但主音和功能关系不同。' },
      { prompt: '自然小调结构是？', options: ['全半全全半全全', '全全半全全全半', '半全全半全全全', '全半全半全半全'], answer: 0, explanation: '自然小调固定为 W-H-W-W-H-W-W。' },
    ],
  },
  {
    id: 'pentatonic', moduleId: 'scale', slug: 'pentatonic', title: '小调五声音阶不只是框型', minutes: 14,
    summary: '小调五声音阶是 1–♭3–4–5–♭7，五个音各有明确功能。', objective: '说出小调五声音阶级数并映射到指板', prerequisite: 'minor-scale',
    coreQuestion: '背熟五个框型后，为什么即兴仍然像爬格子？', formula: '1–♭3–4–5–♭7', status: 'published',
    sections: common('框型只是五个级数在某一区域的排布。真正的音乐感来自知道根音在哪里、目标和弦音在哪里。', 'A 小调五声音阶为 A C D E G。先让乐句停在 A，再比较停在 C、E、G 时的张力差异。'),
    mistakes: ['把每个音等量连续弹奏', '换和弦时完全忽略目标和弦音'],
    quiz: [
      { prompt: '小调五声音阶的级数是？', options: ['1 ♭3 4 5 ♭7', '1 2 3 5 6', '1 3 5 7 9', '1 ♭2 4 ♭5 7'], answer: 0, explanation: '自然小调去掉 2 与 ♭6，留下 1、♭3、4、5、♭7。' },
      { prompt: 'A 小调五声音阶包含？', options: ['A C D E G', 'A B C E F', 'A C♯ D E G♯', 'A B C♯ E F♯'], answer: 0, explanation: '套用 1–♭3–4–5–♭7 得 A C D E G。' },
      { prompt: '即兴时定位根音的主要作用是？', options: ['建立听觉归宿', '让手更快', '改变拍号', '避免所有重复音'], answer: 0, explanation: '根音提供调性中心，是判断其他音张力的参照。' },
      { prompt: '在 Am 和弦上，哪个音是三音？', options: ['C', 'A', 'E', 'G'], answer: 0, explanation: 'Am 由 A-C-E 构成，C 是小三音。' },
    ],
  },
]

// 课程交互数据：每节课独立的声音演示与指板演示
// 使用者：App.tsx LessonPage 读取 interaction 字段，lessonInteractions 作为 fallback
export const lessonInteractions: Record<string, LessonInteraction> = {
  'sound-basics': { audioDemos: [{ id: 'pitch', title: '音高对比', mode: 'sequential', notes: ['C3', 'C4'] }], fretboardDemos: [{ root: 'C', highlightedNotes: ['C'], displayMode: 'note' }] },
  'note-names': { audioDemos: [{ id: 'chromatic', title: '半音阶 12 音', mode: 'sequential', notes: ['C4', 'C♯4', 'D4', 'D♯4', 'E4', 'F4', 'F♯4', 'G4', 'G♯4', 'A4', 'A♯4', 'B4'], tempo: 200 }], fretboardDemos: [{ root: 'C', highlightedNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], displayMode: 'note' }] },
  'whole-half': { audioDemos: [{ id: 'st', title: '半音与全音', mode: 'sequential', notes: ['E4', 'F4', 'F♯4', 'G4'] }], fretboardDemos: [{ root: 'C', highlightedNotes: ['E', 'F', 'F♯', 'G'], displayMode: 'interval' }] },
  'open-strings': { audioDemos: [{ id: 'strings', title: '六根空弦', mode: 'sequential', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] }], fretboardDemos: [{ root: 'E', highlightedNotes: ['E', 'A', 'D', 'G', 'B'], displayMode: 'note' }] },
  'fretboard-map': { audioDemos: [{ id: 'fret', title: '五弦逐品', mode: 'sequential', notes: ['A2', 'A♯2', 'B2', 'C3', 'C♯3', 'D3'] }], fretboardDemos: [{ root: 'C', highlightedNotes: ['C'], displayMode: 'note' }] },
  'octave-shapes': { audioDemos: [{ id: 'oct', title: '八度', mode: 'sequential', notes: ['E2', 'E3', 'E4'] }], fretboardDemos: [{ root: 'E', highlightedNotes: ['E'], displayMode: 'note' }] },
  'pulse-bpm': { audioDemos: [{ id: 'bpm', title: '60 BPM', mode: 'rhythm', notes: ['C4'], tempo: 60 }], fretboardDemos: [] },
  'meter-values': { audioDemos: [{ id: '44', title: '4/4 拍', mode: 'rhythm', notes: ['C4', 'C4', 'C4', 'C4'], tempo: 80 }], fretboardDemos: [] },
  'subdivision': { audioDemos: [{ id: '8th', title: '八分音符', mode: 'rhythm', notes: ['C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4'], tempo: 100 }], fretboardDemos: [] },
  'interval-distance': { audioDemos: [{ id: 'M3', title: '大三度 C→E', mode: 'sequential', notes: ['C4', 'E4'] }, { id: 'm3', title: '小三度 C→E♭', mode: 'sequential', notes: ['C4', 'E♭4'] }], fretboardDemos: [{ root: 'C', highlightedNotes: ['C', 'E', 'E♭'], displayMode: 'interval' }] },
  'thirds-fifths': { audioDemos: [{ id: 'maj', title: '大三和弦骨架', mode: 'sequential', notes: ['C4', 'E4', 'G4'] }, { id: 'min', title: '小三和弦骨架', mode: 'sequential', notes: ['C4', 'E♭4', 'G4'] }], fretboardDemos: [{ root: 'C', highlightedNotes: ['C', 'E', 'G'], displayMode: 'interval' }] },
  'interval-fretboard': { audioDemos: [{ id: 'neck', title: '同弦音程', mode: 'sequential', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'] }], fretboardDemos: [{ root: 'C', highlightedNotes: ['C', 'D', 'E', 'F', 'G', 'A'], displayMode: 'interval' }] },
  'major-scale': { audioDemos: [{ id: 'C-maj', title: 'C 大调音阶', mode: 'sequential', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], tempo: 180 }], fretboardDemos: [{ root: 'C', highlightedNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], displayMode: 'degree' }] },
  'minor-scale': { audioDemos: [{ id: 'A-min', title: 'A 小调音阶', mode: 'sequential', notes: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], tempo: 180 }], fretboardDemos: [{ root: 'A', highlightedNotes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], displayMode: 'degree' }] },
  'pentatonic': { audioDemos: [{ id: 'pent', title: 'A 小调五声', mode: 'sequential', notes: ['A4', 'C5', 'D5', 'E5', 'G5', 'A5'], tempo: 180 }], fretboardDemos: [{ root: 'A', highlightedNotes: ['A', 'C', 'D', 'E', 'G'], displayMode: 'degree' }] },
}

const quizExercises: Exercise[] = lessons.flatMap((lesson) => lesson.quiz.map((quiz, index) => ({
  ...quiz, id: `${lesson.id}-q${index + 1}`, lessonId: lesson.id, type: 'multiple_choice' as const, difficulty: index < 2 ? 1 : 2,
})))

const extraExercises: Exercise[] = [
  // === 指板点击题 (5 题) ===
  { id: 'fret-find-c', lessonId: 'fretboard-map', type: 'fretboard_click', difficulty: 1, prompt: '在指板上点击 C 音的位置（五弦三品或六弦八品）', options: [], answer: 0, explanation: '五弦三品是 C，六弦八品也是 C。', targetNote: 'C', targetContext: 'C' },
  { id: 'fret-find-g', lessonId: 'fretboard-map', type: 'fretboard_click', difficulty: 1, prompt: '在指板上点击 G 音的位置（六弦三品）', options: [], answer: 0, explanation: '六弦空弦 E → 一品 F → 二品 F♯ → 三品 G。', targetNote: 'G', targetContext: 'C' },
  { id: 'fret-find-e', lessonId: 'open-strings', type: 'fretboard_click', difficulty: 1, prompt: '在指板上找到 E 音（一弦或六弦空弦，或二弦五品）', options: [], answer: 0, explanation: '一弦和六弦空弦都是 E，二弦五品也是 E。', targetNote: 'E', targetContext: 'C' },
  { id: 'fret-find-a', lessonId: 'open-strings', type: 'fretboard_click', difficulty: 1, prompt: '在指板上找到 A 音（五弦空弦，或三弦二品）', options: [], answer: 0, explanation: '五弦空弦是 A，三弦二品也是 A。', targetNote: 'A', targetContext: 'C' },
  { id: 'fret-find-d', lessonId: 'open-strings', type: 'fretboard_click', difficulty: 1, prompt: '在指板上找到 D 音（四弦空弦，或二弦三品）', options: [], answer: 0, explanation: '四弦空弦是 D，二弦三品也是 D。', targetNote: 'D', targetContext: 'C' },

  // === 音程输入题 (5 题) ===
  { id: 'int-c-e', lessonId: 'interval-distance', type: 'interval_input', difficulty: 2, prompt: 'C 到 E 是什么音程？', options: [], answer: 0, explanation: '字母跨 C-D-E 三度，实际距离 4 半音，因此是大三度。', intervalAnswer: '大三度' },
  { id: 'int-c-g', lessonId: 'interval-distance', type: 'interval_input', difficulty: 2, prompt: 'C 到 G 是什么音程？', options: [], answer: 0, explanation: 'C 到 G 相隔 7 个半音，构成纯五度。', intervalAnswer: '纯五度' },
  { id: 'int-e-f', lessonId: 'interval-distance', type: 'interval_input', difficulty: 2, prompt: 'E 到 F 是什么音程？', options: [], answer: 0, explanation: 'E-F 只有 1 个半音，字母距离为二度，因此是小二度。', intervalAnswer: '小二度' },
  { id: 'int-c-f', lessonId: 'thirds-fifths', type: 'interval_input', difficulty: 2, prompt: 'C 到 F 是什么音程？', options: [], answer: 0, explanation: '字母跨 C-D-E-F 四度，实际距离 5 半音，因此是纯四度。', intervalAnswer: '纯四度' },
  { id: 'int-a-c', lessonId: 'thirds-fifths', type: 'interval_input', difficulty: 2, prompt: 'A 到 C 是什么音程？', options: [], answer: 0, explanation: '字母跨 A-B-C 三度，实际距离 3 半音，因此是小三度。', intervalAnswer: '小三度' },

  // === 罗马数字输入题 (5 题) ===
  { id: 'rn-c-g', lessonId: 'major-scale', type: 'roman_numeral_input', difficulty: 2, prompt: 'C 大调中，G 和弦的级数是？', options: [], answer: 0, explanation: 'G 是 C 大调第 5 级，大三和弦，因此是 V。', romanAnswer: 'V' },
  { id: 'rn-c-am', lessonId: 'major-scale', type: 'roman_numeral_input', difficulty: 2, prompt: 'C 大调中，Am 和弦的级数是？', options: [], answer: 0, explanation: 'A 是 C 大调第 6 级，小三和弦，因此是 vi。', romanAnswer: 'vi' },
  { id: 'rn-g-d', lessonId: 'major-scale', type: 'roman_numeral_input', difficulty: 2, prompt: 'G 大调中，D 和弦的级数是？', options: [], answer: 0, explanation: 'D 是 G 大调第 5 级，大三和弦，因此是 V。', romanAnswer: 'V' },
  { id: 'rn-c-f', lessonId: 'major-scale', type: 'roman_numeral_input', difficulty: 2, prompt: 'C 大调中，F 和弦的级数是？', options: [], answer: 0, explanation: 'F 是 C 大调第 4 级，大三和弦，因此是 IV。', romanAnswer: 'IV' },
  { id: 'rn-a-dm', lessonId: 'minor-scale', type: 'roman_numeral_input', difficulty: 2, prompt: 'A 小调中，Dm 和弦的级数是？', options: [], answer: 0, explanation: 'D 是 A 小调第 4 级，小三和弦，因此是 iv。', romanAnswer: 'iv' },
]

export const exercises: Exercise[] = [...quizExercises, ...extraExercises]

export const songCases = [
  { id: 'morning-road', title: '清晨公路', artist: '弦上乐理原创', key: 'G', mode: 'major' as const, tempo: 92, meter: '4/4', chords: ['G', 'D', 'Em', 'C'], summary: '经典 I–V–vi–IV，稳定与离开不断循环。', tags: ['流行', '初级'] },
  { id: 'quiet-window', title: '雨夜窗边', artist: '弦上乐理原创', key: 'A', mode: 'minor' as const, tempo: 72, meter: '6/8', chords: ['Am', 'F', 'C', 'G'], summary: '小调中心下的 i–VI–III–VII，适合练习 6/8 分组。', tags: ['小调', '分解和弦'] },
  { id: 'wooden-train', title: '木轨列车', artist: '弦上乐理原创', key: 'D', mode: 'major' as const, tempo: 108, meter: '4/4', chords: ['D', 'A', 'Bm', 'G'], summary: 'D 大调中的常见流行进行，可用 C 指型夹二品。', tags: ['移调', '变调夹'] },
  { id: 'old-lantern', title: '旧灯塔', artist: '弦上乐理原创', key: 'C', mode: 'major' as const, tempo: 80, meter: '3/4', chords: ['C', 'Am', 'F', 'G'], summary: 'I–vi–IV–V 带来明确的离开与回归。', tags: ['三拍子', '终止'] },
  { id: 'blue-corner', title: '蓝色街角', artist: '弦上乐理原创', key: 'E', mode: 'major' as const, tempo: 116, meter: '4/4', chords: ['E7', 'A7', 'E7', 'B7', 'A7', 'E7'], summary: '简化十二小节布鲁斯材料，属七和弦制造持续张力。', tags: ['布鲁斯', '属七'] },
]

export const learningPath = lessons.map((lesson) => lesson.id)
