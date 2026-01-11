
import React, { useState, useEffect } from 'react';
import { FestivalType, TargetAudience, GreetingState } from './types.ts';
import { GeminiService } from './services/gemini.ts';
import ApiKeyModal from './components/ApiKeyModal.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<GreetingState>({
    festival: FestivalType.SPRING_FESTIVAL,
    audience: TargetAudience.COLLEAGUES,
    keywords: '',
    generatedText: '',
    imageUrl: '',
    videoUrl: '',
    audioUrl: '',
    isGeneratingText: false,
    isGeneratingImage: false,
    isGeneratingVideo: false,
    isGeneratingAudio: false,
  });

  const [hasApiKey, setHasApiKey] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert("【iPhone安装指引】\n1. 点击 Safari 底部【分享】按钮\n2. 选择【添加到主屏幕】\n即可像 APP 一样在桌面使用！");
    } else {
      alert("【安装指引】\n请点击浏览器地址栏右侧的【安装】图标，或菜单中的【添加到主屏幕】。");
    }
  };

  const handleInvite = () => {
    const url = window.location.href;
    const message = `✨ 节日祝福生成器 ✨\n\n专为行政办公打造，一键生成精美贺卡、配音和15秒祝福视频！\n\n🔗 立即体验: ${url}\n\n💡 提示：打开链接后，点击“安装”或“添加到主屏幕”，即可作为独立 App 使用，无需每次打开浏览器。`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      alert("✅ 邀请文字已复制！\n现在可以去微信/钉钉粘贴发送给朋友了。");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '节日祝福生成器',
          text: '帮我试下这个行政祝福助手，生成的祝福语和配音挺不错的！',
          url: window.location.href,
        });
      } catch (err) {
        handleInvite();
      }
    } else {
      handleInvite();
    }
  };

  const handleGenerateText = async () => {
    setState(prev => ({ ...prev, isGeneratingText: true }));
    try {
      const text = await GeminiService.generateGreeting(state.festival, state.audience, state.keywords);
      setState(prev => ({ ...prev, generatedText: text }));
    } catch (error) {
      console.error(error);
      alert("文案生成失败: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setState(prev => ({ ...prev, isGeneratingText: false }));
    }
  };

  const handleGenerateImage = async () => {
    if (!state.generatedText) {
      alert("请先生成或输入祝福语");
      return;
    }
    setState(prev => ({ ...prev, isGeneratingImage: true }));
    try {
      const url = await GeminiService.generateImage(state.generatedText, state.festival);
      setState(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error(error);
      alert("图片生成失败");
    } finally {
      setState(prev => ({ ...prev, isGeneratingImage: false }));
    }
  };

  const handleGenerateAudio = async () => {
    if (!state.generatedText) {
      alert("请先生成祝福语");
      return;
    }
    setState(prev => ({ ...prev, isGeneratingAudio: true }));
    try {
      const url = await GeminiService.generateAudio(state.generatedText, state.festival, state.audience);
      setState(prev => ({ ...prev, audioUrl: url }));
    } catch (error) {
      console.error(error);
      alert("音频生成失败");
    } finally {
      setState(prev => ({ ...prev, isGeneratingAudio: false }));
    }
  };

  const handleGenerateVideo = async () => {
    if (!hasApiKey) {
      setShowKeyModal(true);
      return;
    }
    if (!state.generatedText) {
      alert("请先生成或输入祝福语");
      return;
    }
    setState(prev => ({ ...prev, isGeneratingVideo: true }));
    try {
      const url = await GeminiService.generateVideo(state.generatedText, state.festival, state.imageUrl);
      setState(prev => ({ ...prev, videoUrl: url }));
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setShowKeyModal(true);
      } else {
        alert("视频生成失败。由于视频生成较为复杂，请确保网络通畅且 API Key 余额充足。");
      }
    } finally {
      setState(prev => ({ ...prev, isGeneratingVideo: false }));
    }
  };

  return (
    <div className="min-h-screen pb-20 select-none">
      {showKeyModal && <ApiKeyModal onSuccess={() => { setShowKeyModal(false); setHasApiKey(true); }} />}

      <header className="bg-white border-b sticky top-0 z-40 px-4 py-3 md:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-red-600 text-white p-1.5 md:p-2 rounded-lg shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800 tracking-tight">节日祝福生成器</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={handleInstall}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-bold border transition-all ${deferredPrompt ? 'bg-red-600 text-white border-red-700 animate-bounce' : 'bg-red-50 text-red-600 border-red-100'}`}
            >
              {deferredPrompt ? '👇 立即安装' : '如何安装?'}
            </button>

            <button 
              onClick={handleInvite}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 hover:bg-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              邀请朋友
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
              参数设置
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">节日</label>
                  <select className="w-full p-3 border-0 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-red-500 transition-all outline-none" value={state.festival} onChange={(e) => setState(s => ({ ...s, festival: e.target.value as FestivalType }))}>
                    {Object.values(FestivalType).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">对象</label>
                  <select className="w-full p-3 border-0 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-red-500 transition-all outline-none" value={state.audience} onChange={(e) => setState(s => ({ ...s, audience: e.target.value as TargetAudience }))}>
                    {Object.values(TargetAudience).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">核心关键词</label>
                <textarea className="w-full p-4 border-0 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-red-500 transition-all outline-none resize-none" rows={2} placeholder="如：步步高升、健康平安..." value={state.keywords} onChange={(e) => setState(s => ({ ...s, keywords: e.target.value }))} />
              </div>
              <button onClick={handleGenerateText} disabled={state.isGeneratingText} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingText ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200'}`}>
                {state.isGeneratingText ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent" /> : '开始智能创作'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              文案内容
            </h2>
            <textarea className="w-full p-4 border-0 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none mb-4 text-gray-800 leading-relaxed font-medium" rows={5} value={state.generatedText} onChange={(e) => setState(s => ({ ...s, generatedText: e.target.value }))} placeholder="祝福语生成后可在此手动修改..." />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={handleGenerateImage} disabled={state.isGeneratingImage || !state.generatedText} className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingImage || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {state.isGeneratingImage ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" /> : '绘出意境'}
              </button>
              <button onClick={handleGenerateAudio} disabled={state.isGeneratingAudio || !state.generatedText} className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingAudio || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                {state.isGeneratingAudio ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" /> : '配以雅乐'}
              </button>
            </div>
            <button onClick={handleGenerateVideo} disabled={state.isGeneratingVideo || !state.generatedText} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingVideo || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200'}`}>
              {state.isGeneratingVideo ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : '生成 15s 高清动态祝福'}
            </button>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              预览工作台
            </h2>
            {!state.imageUrl && !state.videoUrl && !state.audioUrl && !state.isGeneratingImage && !state.isGeneratingVideo && !state.isGeneratingAudio ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-300 border-2 border-dashed border-gray-50 rounded-3xl">
                <div className="w-20 h-20 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-bold">生成内容后，这里将展示完整效果</p>
                <p className="text-xs mt-2">支持高清导出与分享</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(state.imageUrl || state.isGeneratingImage) && (
                  <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
                    {state.isGeneratingImage ? (
                      <div className="bg-gray-50 aspect-video flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
                        <p className="text-sm text-blue-600 font-bold">正在渲染画卷...</p>
                      </div>
                    ) : (
                      <div className="relative group">
                        <img src={state.imageUrl} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
                          <p className="text-white text-center text-lg md:text-2xl font-bold leading-relaxed tracking-wide drop-shadow-2xl">{state.generatedText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(state.audioUrl || state.isGeneratingAudio) && (
                  <div className="bg-amber-50/50 backdrop-blur-sm border border-amber-100 p-5 rounded-2xl flex flex-col gap-3">
                    {state.isGeneratingAudio ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-bounce h-1.5 w-1.5 bg-amber-500 rounded-full" />
                        <span className="text-sm text-amber-700 font-bold">正在调制节日乐章...</span>
                      </div>
                    ) : (
                      <audio src={state.audioUrl} controls className="w-full h-10 filter sepia" />
                    )}
                  </div>
                )}

                {(state.videoUrl || state.isGeneratingVideo) && (
                  <div className="rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white shadow-indigo-100">
                    {state.isGeneratingVideo ? (
                      <div className="aspect-video flex flex-col items-center justify-center gap-4 text-white p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-400 border-t-transparent mx-auto" />
                        <p className="text-sm font-black">正在制作 15s 高清动画</p>
                        <p className="text-[10px] text-gray-500">制作过程约需 1-2 分钟，请耐心等待</p>
                      </div>
                    ) : (
                      <video src={state.videoUrl} controls className="w-full" autoPlay loop playsInline />
                    )}
                  </div>
                )}

                {(state.imageUrl || state.videoUrl || state.audioUrl) && (
                  <div className="pt-6 flex flex-wrap gap-3">
                    {state.imageUrl && (
                      <button onClick={() => { const l = document.createElement('a'); l.href = state.imageUrl; l.download = `祝福-${state.festival}.png`; l.click(); }} className="px-6 py-3 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all flex items-center gap-2 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        保存贺卡
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-20 text-center pb-8 border-t pt-10 border-gray-100">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 mb-4">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PWA Ready · {window.location.hostname}</span>
        </div>
        <p className="text-gray-400 text-[10px] font-bold">专为企业行政公关打造 · 高端节日祝福一键生成</p>
      </footer>
    </div>
  );
};

export default App;
