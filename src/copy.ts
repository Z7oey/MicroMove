export const copy = {
  app: {
    name: "MicroMove",
    safety:
      "动作做到有轻微拉伸感即可，不要拉到疼。如出现疼痛、头晕、麻木或明显不适，请立即停止。"
  },
  tabs: {
    home: "首页",
    library: "动作库",
    profile: "我的"
  },
  common: {
    back: "返回",
    backHome: "返回首页",
    today: "今天",
    seconds: "秒",
    like: "喜欢",
    unlike: "取消喜欢",
    source: "来源",
    durationMin: (durationMin: number) => `${durationMin} 分钟`,
    durationSec: (durationSec: number) => {
      if (durationSec < 60) return `${durationSec} 秒`;
      const minutes = Math.floor(durationSec / 60);
      const seconds = durationSec % 60;
      return seconds ? `${minutes} 分 ${seconds} 秒` : `${minutes} 分钟`;
    },
    days: (count: number) => `${count} 天`,
    movements: (count: number) => `${count} 个`,
    movementItems: (count: number) => `${count} 个动作`,
    groups: (count: number) => `${count} 组`,
    records: (count: number) => `${count} 条`,
    targetPriority: (targetAreas: string[]) => `${targetAreas.join("、")}优先`,
    movementProgress: (completed: number, total: number) => `${completed} / ${total} 个动作`,
    preferenceSummary: (
      durationSec: number,
      targetAreas: string[],
      space: string,
      intensity: string
    ) => `${copy.common.durationSec(durationSec)}｜${targetAreas.join("、")}优先｜${space}｜${intensity}强度`
  },
  preferences: {
    temporaryTitle: "本次调整",
    temporarySubtitle: "只改这一组，不会覆盖长期偏好。",
    temporarySubmit: "直接开始",
    editTitle: "修改长期偏好",
    editSubtitle: "保存后会用于之后每一次推荐。",
    editSubmit: "保存偏好",
    durationTitle: "你希望每次休息多久？",
    durationHelper: "不用很久，30 秒到 3 分钟，刚好在工作间隙换个档。",
    durationLabel: "本次时长",
    durationMinLabel: "30 秒",
    durationMaxLabel: "3 分钟",
    targetAreasTitle: "你最想优先放松哪里？",
    movementModeTitle: "这次想怎么动？"
  },
  onboarding: {
    eyebrow: "MicroMove",
    title: "调成适合你的放松模式",
    subtitle: "久坐办公，也能简单高效地照顾身体。",
    progressLabel: (current: number, total: number) => `${current}/${total}`,
    durationAction: (durationSec: number) => `选择 ${copy.common.durationSec(durationSec)}`,
    targetAreasAction: "下一题",
    startAction: "开始我的第一组微运动"
  },
  home: {
    title: "工作间隙，动一下",
    todayPrefix: "今天",
    eyebrow: "工作间隙",
    heroTitle: "刚切完任务，简单放松一下",
    heroSubtitle: "低强度、小幅度，适合在办公室顺手完成。",
    recommendationPrefix: "为你推荐：",
    startSeated: "坐着动一下",
    startStanding: "站着动一下",
    seatedDescription: "不方便站起时，先在座位上舒展一下",
    standingDescription: "短暂离开椅子，给身体一个间隙",
    standingPromptTitle: "方便站起来活动吗？",
    standingPromptLead: "连续久坐尽量别超90分钟哦；",
    standingPromptTips: [
      "给腰背少一点持续压力，预防腰酸背痛；",
      "让身体换个姿势，缓解久坐后的僵硬；",
      "加快血液流动，恢复精力upup；",
      "想要代谢更快？主动打断久坐，比久坐后猛练30分钟更友好！"
    ],
    standingPromptStand: "站起来做！",
    standingPromptSit: "这组坐着做",
    startAction: "开始 →",
    temporary: "本次调整",
    editPreferences: "修改长期偏好",
    todayTotal: "今日累计",
    streak: "连续天数"
  },
  player: {
    progress: (current: number, total: number) => `动作 ${current} / ${total}`,
    instructionTitle: "动作指引",
    safetyTitle: "安全提示",
    firstPrevious: "首页",
    previous: "上一个",
    pause: "暂停",
    resume: "继续",
    skip: "跳过",
    restart: "重来",
    learningTitle: "先看一下动作要点",
    learningPhilosophy: "不用做到完美，重点是轻轻活动一下，把久坐打断。",
    learnedAction: "我已学会，立刻开始拉伸",
    tips: "动作提示",
    closeTips: "关闭提示",
    sideTransitionLabel: "换侧准备",
    sideTransitionTitle: (nextName: string) => `准备换到 ${nextName}`,
    cancelNextSide: "取消另一侧",
    imagePlaceholder: "动作示意图待替换"
  },
  completion: {
    singleMode: "试做完成",
    replayMode: "回放结束",
    regularMode: "本次完成",
    regularPrimary: "本次完成",
    replayPrimary: "本次播放",
    home: "回到首页",
    again: "再来一组",
    backLibrary: "回动作库",
    backProfile: "回到我的",
    todayTotal: "今日累计",
    streak: "连续天数",
    movementCount: "完成动作",
    targetAreas: "重点部位",
    regularFeedback: "刚刚好，给身体回了一点电。",
    sittingBreakFeedback: "你刚刚让身体从久坐里出来了一下。",
    feedback: [
      "状态接回来了，继续也不用硬扛。",
      "刚才那段僵硬，先松开一点了。",
      "这不是打断工作，是帮你把状态接回来。",
      "几十秒也够了，身体已经换了个状态。"
    ]
  },
  library: {
    eyebrow: "动作库",
    title: "适合办公间隙的小动作",
    all: "全部",
    myGroups: "我的动作组",
    duration: "15秒",
    instructionTitle: "动作步骤",
    tryExercise: "试做这个动作",
    startNow: "立即跟练",
    backToLibrary: "回动作库",
    pairedPracticeNotice: "跟练时将依次完成两侧或两个方向。"
  },
  profile: {
    currentPreferences: "当前偏好",
    todayTotal: "今日累计",
    streak: "连续天数",
    editPreferences: "修改长期偏好",
    cumulativeDays: "累计运动",
    preferencesAndRecords: "偏好",
    settings: "偏好设置",
    reminder: "提醒",
    addWidget: "增加桌面小组件",
    widgetMessage: "增加桌面组件之后，打断久坐的概率会提高 50% 哦",
    soundAndVibration: "声音与振动",
    music: "音乐",
    vibration: "振动"
  },
  preview: {
    title: "本次动作组",
    totalDuration: "总时长",
    editMovements: "修改动作",
    addMovement: "增加动作",
    save: "保存为我的动作组",
    saved: "已保存到我的动作组",
    saveChanges: "保存修改",
    changesSaved: "修改已保存",
    deleteGroup: "删除动作组",
    start: "开始跟练"
  },
  reminder: {
    title: "拉伸提醒",
    subtitle: "在你选择的时间提醒",
    times: "提醒时间",
    addTime: "添加时间",
    gentleNote: "提醒会按具体时间保存在此设备。Web 原型不发送系统后台通知。",
    save: "保存提醒设置"
  }
} as const;
