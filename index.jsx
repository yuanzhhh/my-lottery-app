import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Plus, Trash2, RefreshCw, Gift, Award, Sparkles } from 'lucide-react';

const LuckyDraw = () => {
  // --- 状态管理 ---
  
  // 奖品列表
  const [prizes, setPrizes] = useState([
    { id: 1, title: '帽美如花', name: '威尔逊帽子' },
    { id: 2, title: '柔手迎春', name: '祖玛珑护手霜' },
    { id: 3, title: '包罗万象', name: '小鹰双肩包' },
    { id: 4, title: '乐享其程', name: '马歇尔音响' },
    { id: 5, title: '一拍即胜', name: '李宁羽毛球拍' },
    { id: 6, title: '律动随行', name: '佳明运动手表' },
    { id: 7, title: '行摄无疆', name: '大疆 Pocket3' },
    { id: 8, title: '遥遥领先', name: '手机' },
  ]);

  // 选中当前要抽的奖品
  const [selectedPrizeId, setSelectedPrizeId] = useState(null);
  
  // 号码池 (1-100)
  const [availableNumbers, setAvailableNumbers] = useState(
    Array.from({ length: 100 }, (_, i) => i + 1)
  );

  // 中奖记录
  const [winners, setWinners] = useState([]);

  // 滚动显示的数字
  const [currentDisplay, setCurrentDisplay] = useState('00');
  
  // 状态控制
  const [isRolling, setIsRolling] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // 新增奖品输入
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeTitle, setNewPrizeTitle] = useState('');
  const [isAddingPrize, setIsAddingPrize] = useState(false);

  // 音效模拟 (视觉上的跳动)
  const [bumpEffect, setBumpEffect] = useState(false);

  // --- 核心逻辑 ---

  // 延时函数
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 随机获取一个当前可用号码用于动画展示
  const getRandomDisplay = () => {
    // 动画过程中可以显示已经被抽过的号码，增加迷惑性
    return Math.floor(Math.random() * 100) + 1;
  };

  // 开始抽奖
  const startLottery = async () => {
    if (!selectedPrizeId) {
      alert("请先在右侧选择一个奖品！");
      return;
    }
    if (availableNumbers.length === 0) {
      alert("所有号码已抽完！");
      return;
    }
    if (isRolling) return;

    setIsRolling(true);
    setShowConfetti(false);
    
    // 确定最终中奖号码 (提前计算)
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const winningNumber = availableNumbers[randomIndex];

    // --- 趣味变速滚动逻辑 ---
    
    // 阶段 1: 极速启动 (模拟引擎加速)
    let speed = 50;
    for (let i = 0; i < 20; i++) {
      setCurrentDisplay(getRandomDisplay());
      setBumpEffect(prev => !prev);
      await sleep(speed);
    }

    // 阶段 2: 中途减速 (制造悬念，好像要停了)
    // 速度从 50ms 变慢到 300ms
    for (let i = 0; i < 15; i++) {
      setCurrentDisplay(getRandomDisplay());
      speed += 20; 
      await sleep(speed);
    }

    // 阶段 3: 突然加速 (戏弄效果，"骗你的，还没停")
    // 瞬间回到极速
    speed = 40;
    for (let i = 0; i < 25; i++) {
      setCurrentDisplay(getRandomDisplay());
      setBumpEffect(prev => !prev);
      await sleep(speed);
    }

    // 阶段 4: 最终减速锁定
    // 缓慢减速直到停下
    for (let i = 0; i < 10; i++) {
      setCurrentDisplay(getRandomDisplay());
      speed += 40; 
      await sleep(speed);
    }

    // 最后一跳，显示中奖号码
    setCurrentDisplay(winningNumber);
    setIsRolling(false);
    setShowConfetti(true);

    // --- 更新数据 ---
    // 1. 从可用池中移除
    const newAvailable = availableNumbers.filter(n => n !== winningNumber);
    setAvailableNumbers(newAvailable);

    // 2. 记录中奖者
    const prizeInfo = prizes.find(p => p.id === selectedPrizeId);
    const newWinner = {
      number: winningNumber,
      prizeName: prizeInfo.name,
      prizeTitle: prizeInfo.title,
      timestamp: new Date().toLocaleTimeString()
    };
    setWinners([newWinner, ...winners]); // 新中奖者排最前
  };

  // 添加新奖品
  const handleAddPrize = () => {
    if (!newPrizeName) return;
    const newId = prizes.length > 0 ? Math.max(...prizes.map(p => p.id)) + 1 : 1;
    setPrizes([...prizes, { 
      id: newId, 
      title: newPrizeTitle || '追加大奖', 
      name: newPrizeName 
    }]);
    setNewPrizeName('');
    setNewPrizeTitle('');
    setIsAddingPrize(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-red-900 text-yellow-100 font-sans overflow-hidden relative">
      {/* 背景纹理层 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at center, #ffeb3b 1px, transparent 1px)',
             backgroundSize: '30px 30px'
           }}>
      </div>
      
      {/* 顶部标题 */}
      <header className="z-10 text-center py-6 bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b-2 border-yellow-600 shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-sm">
          幸运落谁家 · 年会盛典
        </h1>
        <p className="text-red-200 text-sm mt-2 opacity-80">剩余号码: {availableNumbers.length} / 100</p>
      </header>

      {/* 主体布局 */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4 z-10 relative">
        
        {/* 左侧：中奖名单 (25%) */}
        <section className="w-full md:w-1/4 bg-red-950/80 rounded-xl border-2 border-yellow-700/50 flex flex-col shadow-2xl backdrop-blur-sm order-3 md:order-1">
          <div className="p-4 bg-red-900/90 border-b border-yellow-700/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <Award className="w-5 h-5" /> 幸运榜单
            </h2>
            <span className="text-xs text-yellow-600/80">最新在顶</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {winners.length === 0 ? (
              <div className="text-center text-red-400/50 py-10 italic">
                虚位以待...
              </div>
            ) : (
              winners.map((winner, idx) => (
                <div key={idx} className="bg-gradient-to-r from-red-900 to-red-800 p-3 rounded border border-yellow-900/30 flex items-center gap-3 animate-in slide-in-from-left duration-500">
                  <div className="w-10 h-10 rounded-full bg-yellow-600 text-red-900 flex items-center justify-center font-bold text-lg shadow-inner">
                    {winner.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-yellow-200 text-sm font-medium truncate">{winner.prizeTitle}</div>
                    <div className="text-red-100 text-xs truncate">{winner.prizeName}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 中间：滚动抽奖区 (50%) */}
        <section className="w-full md:w-2/4 flex flex-col items-center justify-center relative order-1 md:order-2 min-h-[300px]">
          {/* 光效装饰 */}
          <div className="absolute inset-0 bg-radial-gradient from-yellow-500/10 to-transparent pointer-events-none"></div>
          
          <div className="relative mb-8">
            {/* 选中奖品展示 */}
            <div className="text-center mb-6 h-16 transition-all duration-300">
              {selectedPrizeId ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="text-yellow-500 text-lg tracking-widest uppercase mb-1">正在抽取</div>
                  <div className="text-3xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                    {prizes.find(p => p.id === selectedPrizeId)?.name}
                  </div>
                </div>
              ) : (
                <div className="text-red-300/50 text-xl animate-pulse">
                  请先在右侧选择奖品
                </div>
              )}
            </div>

            {/* 滚动数字大屏 */}
            <div className={`
              relative w-64 h-64 md:w-80 md:h-80 rounded-full 
              border-[8px] border-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.3)]
              bg-gradient-to-br from-red-800 to-black
              flex items-center justify-center
              transform transition-transform duration-100
              ${bumpEffect ? 'scale-105' : 'scale-100'}
              ${showConfetti ? 'shadow-[0_0_100px_rgba(234,179,8,0.8)] border-yellow-300' : ''}
            `}>
              <div className="text-[8rem] md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-600 tabular-nums leading-none drop-shadow-sm filter">
                {currentDisplay}
              </div>
              
              {/* 装饰星星 */}
              {showConfetti && (
                 <>
                  <Sparkles className="absolute top-4 right-10 text-yellow-300 w-12 h-12 animate-bounce" />
                  <Sparkles className="absolute bottom-10 left-6 text-yellow-300 w-8 h-8 animate-pulse" />
                 </>
              )}
            </div>
          </div>

          {/* 抽奖按钮 */}
          <button
            onClick={startLottery}
            disabled={isRolling || !selectedPrizeId}
            className={`
              px-12 py-4 rounded-full text-2xl font-bold tracking-widest shadow-xl
              transform transition-all duration-200
              ${isRolling 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed scale-95' 
                : !selectedPrizeId 
                  ? 'bg-red-800 text-red-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-red-900 hover:scale-105 hover:shadow-yellow-500/50 active:scale-95 cursor-pointer ring-4 ring-yellow-700/30'}
            `}
          >
            {isRolling ? '抽奖中...' : '开始抽奖'}
          </button>
        </section>

        {/* 右侧：奖品列表 (25%) */}
        <section className="w-full md:w-1/4 bg-red-950/80 rounded-xl border-2 border-yellow-700/50 flex flex-col shadow-2xl backdrop-blur-sm order-2 md:order-3">
          <div className="p-4 bg-red-900/90 border-b border-yellow-700/50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <Gift className="w-5 h-5" /> 奖品列表
            </h2>
            <button 
              onClick={() => setIsAddingPrize(!isAddingPrize)}
              className="p-1 hover:bg-red-800 rounded text-yellow-500 transition-colors"
              title="添加奖品"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 追加奖品面板 */}
          {isAddingPrize && (
            <div className="p-3 bg-red-900/50 border-b border-red-800 animate-in slide-in-from-top">
              <input 
                type="text" 
                placeholder="奖项名称 (如: 阳光普照奖)" 
                className="w-full mb-2 bg-red-950 border border-red-700 rounded px-2 py-1 text-sm text-yellow-100 placeholder-red-400 focus:outline-none focus:border-yellow-600"
                value={newPrizeTitle}
                onChange={(e) => setNewPrizeTitle(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="奖品内容" 
                  className="flex-1 bg-red-950 border border-red-700 rounded px-2 py-1 text-sm text-yellow-100 placeholder-red-400 focus:outline-none focus:border-yellow-600"
                  value={newPrizeName}
                  onChange={(e) => setNewPrizeName(e.target.value)}
                />
                <button 
                  onClick={handleAddPrize}
                  className="bg-yellow-600 text-red-900 px-3 py-1 rounded text-sm font-bold hover:bg-yellow-500"
                >
                  确定
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {prizes.map((prize) => (
              <div 
                key={prize.id}
                onClick={() => !isRolling && setSelectedPrizeId(prize.id)}
                className={`
                  p-3 rounded cursor-pointer transition-all border
                  flex items-center justify-between group
                  ${selectedPrizeId === prize.id 
                    ? 'bg-gradient-to-r from-yellow-700/80 to-yellow-600/80 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)] transform scale-[1.02]' 
                    : 'bg-red-900/40 border-transparent hover:bg-red-800 hover:border-red-600'}
                `}
              >
                <div>
                  <div className={`text-xs ${selectedPrizeId === prize.id ? 'text-yellow-100' : 'text-yellow-600'}`}>
                    {prize.title}
                  </div>
                  <div className={`font-bold ${selectedPrizeId === prize.id ? 'text-white' : 'text-red-100'}`}>
                    {prize.name}
                  </div>
                </div>
                {selectedPrizeId === prize.id && <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />}
              </div>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(161, 98, 7, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(161, 98, 7, 0.8);
        }
      `}</style>
    </div>
  );
};

export default LuckyDraw;
