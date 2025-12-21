
import React, { useState, useEffect, useCallback } from 'react';
import { processText, parseFileText } from './utils/textUtils';
import { analyzeTextWithGemini } from './services/geminiService';
import WordCloudRenderer from './components/WordCloudRenderer';
import StatsChart from './components/StatsChart';
import SentimentPanel from './components/SentimentPanel';
import { WordData, CloudConfig, AnalysisMode, SentimentData } from './types';
import { FONT_FAMILIES } from './constants';
import { BarChart3, Cloud, FileText, Settings2, Sparkles, Upload, RotateCcw, Ban, Heart, AlignLeft, AlignJustify, GripHorizontal, PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [overallTone, setOverallTone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cloud' | 'stats' | 'sentiment'>('cloud');
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.LOCAL);
  
  // 过滤与包含
  const [exclusionText, setExclusionText] = useState('');
  const [inclusionText, setInclusionText] = useState('');
  
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
    if (!inputText.trim() && !inclusionText.trim()) return;
    
    setIsLoading(true);
    setWordData([]);
    setSentimentData([]);
    setOverallTone('');

    // 解析剔除词
    const customExclusions = new Set<string>(
      exclusionText.split(/[,，\s\n]+/).map(w => w.trim()).filter(Boolean)
    );

    // 解析强制添加词
    const customInclusions: WordData[] = inclusionText
      .split(/[,，\s\n]+/)
      .map(item => {
        const [text, val] = item.trim().split(':');
        return { 
          text: text, 
          value: val ? parseInt(val, 10) : -1 // -1 表示待定权重
        };
      })
      .filter(item => item.text);

    try {
      let resultData: WordData[] = [];
      
      if (mode === AnalysisMode.AI && inputText.trim()) {
        const result = await analyzeTextWithGemini(inputText);
        resultData = result.keywords;
        setSentimentData(result.sentiment);
        setOverallTone(result.overallTone);
      } else if (inputText.trim()) {
        await new Promise(r => setTimeout(r, 100));
        resultData = processText(inputText, true, customExclusions);
      }

      // 1. 先进行剔除过滤
      let filtered = resultData.filter(item => !customExclusions.has(item.text));

      // 2. 合并强制添加词
      const finalMap = new Map<string, number>();
      filtered.forEach(item => finalMap.set(item.text, item.value));

      // 确定默认权重（基于当前结果的最大值）
      const maxExisting = filtered.length > 0 ? Math.max(...filtered.map(i => i.value)) : 50;

      customInclusions.forEach(inc => {
        const weight = inc.value === -1 ? maxExisting * 1.2 : inc.value;
        finalMap.set(inc.text, weight);
      });

      // 3. 转换回数组并排序
      const finalData = Array.from(finalMap.entries())
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 200); // 限制显示数量

      setWordData(finalData);
    } catch (error) {
      console.error("Generation failed", error);
      alert("生成失败，请检查网络或 API Key 设置。");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, mode, exclusionText, inclusionText]);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-md text-white">
            <Cloud className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              云图 Word Cloud
            </h1>
            <p className="text-slate-500 text-sm">专业中文词云与数据分析平台</p>
          </div>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'cloud' ? 'bg-primary text-white shadow' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <Cloud size={18} /> 词云可视化
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'stats' ? 'bg-primary text-white shadow' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <BarChart3 size={18} /> 词频统计
          </button>
          <button
            onClick={() => setActiveTab('sentiment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${activeTab === 'sentiment' ? 'bg-primary text-white shadow' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <Heart size={18} /> 情绪分析
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧控制栏 */}
        <section className="lg:col-span-4 space-y-6">
          {/* 输入框 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-700">
                <FileText size={20} className="text-primary" /> 原始文本
              </h2>
              <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 text-xs px-3 py-1.5 rounded border border-slate-200 flex items-center gap-2 transition-colors text-slate-600">
                <Upload size={14} /> 导入文档
                <input type="file" accept=".txt,.md,.csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请粘贴您想要分析的中文段落、文章或歌词..."
              className="w-full h-48 bg-slate-50/50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
               <span>已输入 {inputText.length} 字符</span>
               <button onClick={() => setInputText('')} className="hover:text-red-500">清除内容</button>
            </div>
          </div>

          {/* 关键词精控 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-700">
              <Settings2 size={20} className="text-secondary" /> 关键词精准控制
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                  <Ban size={12} /> 剔除词 (Exclusions)
                </label>
                <textarea
                  value={exclusionText}
                  onChange={(e) => setExclusionText(e.target.value)}
                  placeholder="输入不想显示的词，用逗号分隔..."
                  className="w-full h-16 bg-rose-50/30 border border-rose-100 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-rose-200 outline-none resize-none placeholder:text-rose-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                  <PlusCircle size={12} /> 强制包含/增强 (Inclusions)
                </label>
                <textarea
                  value={inclusionText}
                  onChange={(e) => setInclusionText(e.target.value)}
                  placeholder="格式: 词 或 词:权重 (如 AI:100)"
                  className="w-full h-16 bg-emerald-50/30 border border-emerald-100 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-200 outline-none resize-none placeholder:text-emerald-300"
                />
              </div>
            </div>
          </div>

          {/* 分析配置 */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="space-y-5">
               <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">分析引擎</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setMode(AnalysisMode.LOCAL)}
                    className={`text-sm py-2 rounded-lg border transition-all ${mode === AnalysisMode.LOCAL ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}
                  >
                    本地分词
                  </button>
                  <button 
                    onClick={() => setMode(AnalysisMode.AI)}
                    className={`text-sm py-2 rounded-lg border flex items-center justify-center gap-2 transition-all ${mode === AnalysisMode.AI ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}
                  >
                    <Sparkles size={14} /> AI 语义
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">文字排版</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setConfig({...config, rotationAngles: [0, 0], rotations: 0})}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${config.rotations === 0 && config.rotationAngles[0] === 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}
                  >
                    <AlignLeft size={16} />
                    <span className="text-[10px]">横排</span>
                  </button>
                  <button 
                    onClick={() => setConfig({...config, rotationAngles: [-90, -90], rotations: 0})}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${config.rotations === 0 && config.rotationAngles[0] === -90 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}
                  >
                    <AlignJustify className="rotate-90" size={16} />
                    <span className="text-[10px]">竖排</span>
                  </button>
                  <button 
                    onClick={() => setConfig({...config, rotationAngles: [-90, 0], rotations: 2})}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${config.rotations > 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}
                  >
                    <GripHorizontal size={16} />
                    <span className="text-[10px]">随机</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">艺术字体</label>
                <select 
                  value={config.fontFamily}
                  onChange={(e) => setConfig({...config, fontFamily: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-sm outline-none cursor-pointer text-slate-700 font-medium"
                >
                  {FONT_FAMILIES.map(font => <option key={font} value={font}>{font}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || (!inputText && !inclusionText)}
              className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
                isLoading || (!inputText && !inclusionText)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110'
              }`}
            >
              {isLoading ? (
                <>
                  <RotateCcw className="animate-spin" size={20} /> 正在处理数据...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> 生成分析报告
                </>
              )}
            </button>
          </div>
        </section>

        {/* 右侧展示区 */}
        <section className="lg:col-span-8 h-full min-h-[600px]" ref={containerRef}>
           {wordData.length > 0 || sentimentData.length > 0 ? (
             <div className="h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {activeTab === 'cloud' && (
                 <WordCloudRenderer 
                    data={wordData} 
                    config={config} 
                    width={dimensions.width} 
                    height={dimensions.height} 
                 />
               )}
               {activeTab === 'stats' && (
                 <StatsChart data={wordData} />
               )}
               {activeTab === 'sentiment' && (
                 mode === AnalysisMode.AI ? (
                    <SentimentPanel data={sentimentData} overallTone={overallTone} />
                 ) : (
                    <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 p-8 text-center shadow-sm">
                      <Sparkles size={40} className="mb-4 text-slate-300" />
                      <h3 className="text-slate-600 font-semibold text-lg">开启 AI 情绪洞察</h3>
                      <p className="max-w-xs mt-2 text-sm">本地分词仅支持统计词频。请切换至 <span className="text-purple-500 font-bold">AI 增强模式</span> 以获取深度的情感分布和语调分析报告。</p>
                    </div>
                 )
               )}
               
               {wordData.length > 0 && activeTab !== 'sentiment' && (
                 <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-slate-200 shadow-sm text-xs font-medium">
                    <div className="flex gap-4">
                      <span className="text-slate-400 uppercase">词条总数: <span className="text-slate-800">{wordData.length}</span></span>
                      <span className="text-slate-400 uppercase">核心关键词: <span className="text-primary">{wordData[0]?.text}</span></span>
                    </div>
                    <button className="text-primary hover:underline" onClick={() => window.print()}>导出 PDF</button>
                 </div>
               )}
             </div>
           ) : (
             <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 shadow-sm transition-all hover:bg-slate-50/50">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Cloud size={48} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-600 mb-2">准备好创建您的云图了吗？</h3>
                <p className="text-sm opacity-70 mb-8">输入文本并点击下方的“生成分析报告”按钮即可开始</p>
                <div className="flex gap-3">
                   <div className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold">分词统计</div>
                   <div className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold">词云渲染</div>
                   <div className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold">AI 情绪</div>
                </div>
             </div>
           )}
        </section>
      </main>
    </div>
  );
};

export default App;
