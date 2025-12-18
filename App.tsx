import React, { useState, useEffect, useCallback } from 'react';
import { processText, parseFileText } from './utils/textUtils';
import { analyzeTextWithGemini } from './services/geminiService';
import WordCloudRenderer from './components/WordCloudRenderer';
import StatsChart from './components/StatsChart';
import SentimentPanel from './components/SentimentPanel';
import { WordData, CloudConfig, AnalysisMode, SentimentData } from './types';
import { FONT_FAMILIES } from './constants';
import { BarChart3, Cloud, FileText, Settings2, Sparkles, Upload, RotateCcw, Ban, Heart, AlignLeft, AlignJustify, GripHorizontal } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [overallTone, setOverallTone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'stats' | 'sentiment'>('cloud');
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.LOCAL);
  const [exclusionText, setExclusionText] = useState('');
  
  const [config, setConfig] = useState<CloudConfig>({
    fontFamily: 'Microsoft YaHei',
    rotationAngles: [0, 0],
    rotations: 0,
    scale: 'linear',
    spiral: 'archimedean',
    padding: 2,
  });

  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 500
        });
      }
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [activeTab]);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setWordData([]);
    setSentimentData([]);
    setOverallTone('');

    const customExclusions = new Set(
      exclusionText.split(/[,，\s\n]+/).map(w => w.trim()).filter(Boolean)
    );

    try {
      if (mode === AnalysisMode.AI) {
        const result = await analyzeTextWithGemini(inputText);
        setWordData(result.keywords.filter(item => !customExclusions.has(item.text)));
        setSentimentData(result.sentiment);
        setOverallTone(result.overallTone);
      } else {
        await new Promise(r => setTimeout(r, 100));
        const data = processText(inputText, true, customExclusions);
        setWordData(data);
      }
    } catch (error) {
      console.error("Generation failed", error);
      alert("生成失败，请检查网络或 API Key 设置。");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, mode, exclusionText]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await parseFileText(file);
        setInputText(text);
      } catch (err) {
        console.error("File read error", err);
        alert("无法读取文件。");
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark text-slate-200 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg text-white">
            <Cloud className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              云图 Word Cloud
            </h1>
            <p className="text-slate-400 text-sm">智能中文分词与情绪分析系统</p>
          </div>
        </div>
        
        <div className="flex bg-surface p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'cloud' ? 'bg-primary text-white shadow' : 'hover:bg-slate-700 text-slate-400'}`}
          >
            <Cloud size={18} /> 词云
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'stats' ? 'bg-primary text-white shadow' : 'hover:bg-slate-700 text-slate-400'}`}
          >
            <BarChart3 size={18} /> 统计
          </button>
          <button
            onClick={() => setActiveTab('sentiment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'sentiment' ? 'bg-primary text-white shadow' : 'hover:bg-slate-700 text-slate-400'}`}
          >
            <Heart size={18} /> 情绪
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-surface rounded-xl p-4 border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-200">
                <FileText size={20} className="text-primary" /> 文本内容
              </h2>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded border border-slate-600 flex items-center gap-2 transition-colors">
                <Upload size={14} /> 上传文件
                <input type="file" accept=".txt,.md,.csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在这里粘贴中文文本..."
              className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
               <span>{inputText.length} 字符</span>
               <button onClick={() => setInputText('')} className="hover:text-red-400">重置</button>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-4 border border-slate-700 shadow-xl">
            <h2 className="flex items-center gap-2 font-semibold text-slate-200 mb-4">
              <Settings2 size={20} className="text-secondary" /> 分析配置
            </h2>
            
            <div className="space-y-4">
               <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">分析引擎</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setMode(AnalysisMode.LOCAL)}
                    className={`text-sm py-2 rounded-lg border transition-all ${mode === AnalysisMode.LOCAL ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-transparent text-slate-400 hover:border-slate-600'}`}
                  >
                    本地引擎
                  </button>
                  <button 
                    onClick={() => setMode(AnalysisMode.AI)}
                    className={`text-sm py-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${mode === AnalysisMode.AI ? 'bg-pink-500/20 border-pink-500 text-pink-300' : 'bg-slate-800 border-transparent text-slate-400 hover:border-slate-600'}`}
                  >
                    <Sparkles size={14} /> AI 增强
                  </button>
                </div>
                {mode === AnalysisMode.AI && (
                   <p className="text-[10px] text-pink-400/70 leading-tight">
                     AI 模式将启用语义词频提取与多维度情绪分析。
                   </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1 tracking-wider">
                  <Ban size={12} /> 剔除关键词
                </label>
                <textarea
                  value={exclusionText}
                  onChange={(e) => setExclusionText(e.target.value)}
                  placeholder="用逗号或换行分隔..."
                  className="w-full h-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-secondary outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">词排版方向</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    title="横向排版"
                    onClick={() => setConfig({...config, rotationAngles: [0, 0], rotations: 0})}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${config.rotations === 0 && config.rotationAngles[0] === 0 ? 'bg-primary/20 border-primary text-primary-foreground' : 'bg-slate-800 border-transparent text-slate-400 hover:border-slate-600'}`}
                  >
                    <AlignLeft size={16} />
                    <span className="text-[10px]">横排</span>
                  </button>
                  <button 
                    title="纵向排版"
                    onClick={() => setConfig({...config, rotationAngles: [-90, -90], rotations: 0})}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${config.rotations === 0 && config.rotationAngles[0] === -90 ? 'bg-primary/20 border-primary text-primary-foreground' : 'bg-slate-800 border-transparent text-slate-400 hover:border-slate-600'}`}
                  >
                    <AlignJustify className="rotate-90" size={16} />
                    <span className="text-[10px]">竖排</span>
                  </button>
                  <button 
                    title="随机混合"
                    onClick={() => setConfig({...config, rotationAngles: [-90, 0], rotations: 2})}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${config.rotations > 0 ? 'bg-primary/20 border-primary text-primary-foreground' : 'bg-slate-800 border-transparent text-slate-400 hover:border-slate-600'}`}
                  >
                    <GripHorizontal size={16} />
                    <span className="text-[10px]">混合</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">显示字体</label>
                <select 
                  value={config.fontFamily}
                  onChange={(e) => setConfig({...config, fontFamily: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm outline-none cursor-pointer"
                >
                  {FONT_FAMILIES.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText}
              className={`w-full mt-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                isLoading || !inputText 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg active:scale-95 hover:brightness-110'
              }`}
            >
              {isLoading ? (
                <>
                  <RotateCcw className="animate-spin" size={18} /> 正在分析数据...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> 立即生成结果
                </>
              )}
            </button>
          </div>
        </section>

        <section className="lg:col-span-8 h-full min-h-[500px]" ref={containerRef}>
           {wordData.length > 0 || sentimentData.length > 0 ? (
             <div className="h-full animate-in fade-in zoom-in duration-500">
               {activeTab === 'cloud' && wordData.length > 0 && (
                 <WordCloudRenderer 
                    data={wordData} 
                    config={config} 
                    width={dimensions.width} 
                    height={dimensions.height} 
                 />
               )}
               {activeTab === 'stats' && wordData.length > 0 && (
                 <StatsChart data={wordData} />
               )}
               {activeTab === 'sentiment' && (
                 mode === AnalysisMode.AI ? (
                    <SentimentPanel data={sentimentData} overallTone={overallTone} />
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-surface/50 rounded-xl border-2 border-dashed border-slate-700 text-slate-500 p-8 text-center">
                      <Sparkles size={40} className="mb-4 text-slate-600" />
                      <p>本地引擎暂不支持情绪深度分析</p>
                      <p className="text-xs mt-2">请切换至 <span className="text-pink-400">AI 增强模式</span> 以获取情感洞察</p>
                    </div>
                 )
               )}
               
               {wordData.length > 0 && activeTab !== 'sentiment' && (
                 <div className="mt-4 flex items-center justify-between text-sm text-slate-500 px-2">
                    <span>词条数量: {wordData.length}</span>
                    <span>高频关键词: <span className="text-primary font-bold">{wordData[0]?.text}</span> ({wordData[0]?.value})</span>
                 </div>
               )}
             </div>
           ) : (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-surface/50 rounded-xl border-2 border-dashed border-slate-700 text-slate-500">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Cloud size={40} className="text-slate-600 opacity-20" />
                </div>
                <p className="text-lg font-medium">等待输入文本</p>
                <p className="text-sm opacity-70">支持直接粘贴或上传 txt 文本文件</p>
             </div>
           )}
        </section>
      </main>
    </div>
  );
};

export default App;