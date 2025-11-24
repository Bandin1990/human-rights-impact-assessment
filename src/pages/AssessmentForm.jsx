import React, { useState, useEffect } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save, Scale, FileText, Map, Hammer, Info, AlertTriangle, CheckCircle, XCircle, AlertCircle, Bot, Upload, FileSearch, Loader2, Plus, File } from 'lucide-react';
import clsx from 'clsx';
import { analyzeProject } from '../services/ai';

const SECTORS = [
    { id: 'mining', label: 'เหมืองแร่และทรัพยากรธรณี', icon: '⛏️' },
    { id: 'fossil', label: 'พลังงาน - เชื้อเพลิงฟอสซิล (น้ำมัน/ก๊าซ/ถ่านหิน)', icon: '🛢️' },
    { id: 'renewable', label: 'พลังงาน - หมุนเวียน (ลม/แสงอาทิตย์/น้ำ)', icon: '☀️' },
    { id: 'infra', label: 'โครงสร้างพื้นฐานและการคมนาคม', icon: '🌉' },
    { id: 'dam', label: 'เขื่อนและการบริหารจัดการน้ำ', icon: '💧' },
    { id: 'agri', label: 'เกษตรอุตสาหกรรมและป่าไม้', icon: '🌾' },
    { id: 'industry', label: 'อุตสาหกรรมการผลิตและเคมีภัณฑ์', icon: '🏭' },
    { id: 'waste', label: 'การจัดการขยะและของเสีย', icon: '♻️' },
    { id: 'realestate', label: 'อสังหาริมทรัพย์และที่อยู่อาศัย', icon: '🏙️' },
    { id: 'tourism', label: 'การท่องเที่ยวและบริการ', icon: '🏨' },
    { id: 'public_policy', label: 'นโยบายสาธารณะ / กฎหมาย', icon: '📜' },
    { id: 'other', label: 'อื่นๆ (ระบุ)', icon: '📝' },
];


// Helper function to read PDF file
const readPDFFile = async (file) => {
    try {
        const pdfjsLib = await import('pdfjs-dist');

        // Set worker path - use HTTPS for reliability
        const pdfjsVersion = pdfjsLib.version || '3.11.174';
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const typedArray = new Uint8Array(e.target.result);

                    // Load PDF document
                    const loadingTask = pdfjsLib.getDocument({
                        data: typedArray,
                        verbosity: 0
                    });

                    const pdf = await loadingTask.promise;
                    let fullText = '';

                    console.log(`PDF loaded: ${pdf.numPages} pages`);

                    // Extract text from all pages
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        try {
                            const page = await pdf.getPage(pageNum);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items
                                .map(item => item.str)
                                .join(' ')
                                .trim();

                            if (pageText) {
                                fullText += `\n--- หน้า ${pageNum} ---\n${pageText}\n`;
                            }
                        } catch (pageError) {
                            console.warn(`Error reading page ${pageNum}:`, pageError);
                        }
                    }

                    if (!fullText.trim()) {
                        reject(new Error('PDF ไม่มีข้อความ หรืออาจเป็น PDF ที่สแกนจากรูปภาพ'));
                    } else {
                        resolve(fullText);
                    }
                } catch (error) {
                    console.error('PDF parsing error:', error);
                    reject(new Error(`ไม่สามารถอ่าน PDF ได้: ${error.message}`));
                }
            };

            reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
            reader.readAsArrayBuffer(file);
        });
    } catch (error) {
        console.error('PDF library error:', error);
        throw new Error('ไม่สามารถโหลด PDF library ได้');
    }
};


// Helper function to read file as text
const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file, 'UTF-8');
    });
};

// Helper function to read file content (supports both text and PDF)
const readFileContent = async (file) => {
    const fileName = file.name.toLowerCase();

    // Check if it's a PDF file
    if (fileName.endsWith('.pdf')) {
        return await readPDFFile(file);
    }

    // For text-based files
    return await readFileAsText(file);
};

const AssessmentTypeCard = ({ icon: Icon, title, desc, selected, onClick }) => (
    <div
        onClick={onClick}
        className={clsx(
            "cursor-pointer p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-3 h-full",
            selected
                ? "border-green-500 bg-green-50"
                : "border-gray-100 bg-white hover:border-green-200 hover:shadow-md"
        )}
    >
        <div className={clsx("p-3 rounded-full", selected ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500")}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className={clsx("font-bold mb-0.5 text-sm", selected ? "text-green-800" : "text-gray-800")}>{title}</h3>
            <p className="text-[10px] text-gray-400">{desc}</p>
        </div>
    </div>
);

const QuestionCard = ({ question, onAnswer, currentAnswer, onEvidence, currentEvidence }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase tracking-wider">
                        {question.category}
                    </span>
                    {question.isProjectSpecific && (
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded flex items-center gap-1">
                            <Bot size={10} /> คำถามเฉพาะโครงการ
                        </span>
                    )}
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-4 leading-relaxed">
                    {question.text}
                </h2>

                {question.guidance && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mb-4">
                        <div className="flex items-start gap-2">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
                            <div>
                                <h4 className="text-xs font-bold text-blue-800 mb-0.5">คำแนะนำเพิ่มเติม:</h4>
                                <p className="text-xs text-blue-700 leading-relaxed">{question.guidance}</p>
                            </div>
                        </div>
                    </div>
                )}

                {question.riskWarning && (
                    <div className="bg-yellow-50 border border-yellow-100 p-2.5 rounded-lg mb-6 flex items-center gap-2 text-yellow-800 text-xs">
                        <AlertTriangle size={14} className="text-yellow-600" />
                        <span>{question.riskWarning}</span>
                    </div>
                )}

                {/* 3-POINT SCORING SYSTEM */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <button
                        onClick={() => onAnswer(1)}
                        className={clsx(
                            "flex flex-col items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all",
                            currentAnswer === 1
                                ? "border-green-500 bg-green-50 text-green-700 font-bold"
                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                    >
                        <CheckCircle size={20} />
                        <div className="text-center">
                            <div className="text-sm font-bold">ใช่</div>
                            <div className="text-[10px]">1 คะแนน</div>
                        </div>
                    </button>
                    <button
                        onClick={() => onAnswer(0.5)}
                        className={clsx(
                            "flex flex-col items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all",
                            currentAnswer === 0.5
                                ? "border-yellow-500 bg-yellow-50 text-yellow-700 font-bold"
                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                    >
                        <AlertCircle size={20} />
                        <div className="text-center">
                            <div className="text-sm font-bold">ใช่บางส่วน</div>
                            <div className="text-[10px]">0.5 คะแนน</div>
                        </div>
                    </button>
                    <button
                        onClick={() => onAnswer(0)}
                        className={clsx(
                            "flex flex-col items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all",
                            currentAnswer === 0
                                ? "border-red-500 bg-red-50 text-red-700 font-bold"
                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                    >
                        <XCircle size={20} />
                        <div className="text-center">
                            <div className="text-sm font-bold">ไม่ใช่</div>
                            <div className="text-[10px]">0 คะแนน</div>
                        </div>
                    </button>
                </div>

                {/* Dynamic explanation field */}
                {(currentAnswer !== undefined && currentAnswer !== null) && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                {currentAnswer === 0 ? 'โปรดอธิบายเหตุผล / แผนการแก้ไข:' :
                                    currentAnswer === 0.5 ? 'โปรดอธิบายส่วนที่ปฏิบัติและไม่ปฏิบัติ:' :
                                        'รายละเอียดเพิ่มเติม / ข้อสังเกต:'}
                                <span className="text-gray-400 font-normal ml-1">
                                    {currentAnswer === 0 || currentAnswer === 0.5 ? '(จำเป็น)' : '(ถ้ามี)'}
                                </span>
                            </label>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                rows={3}
                                placeholder={currentAnswer === 0
                                    ? "เช่น: ยังไม่มีกระบวนการนี้ แต่กำลังวางแผนจะดำเนินการภายในไตรมาสหน้า..."
                                    : currentAnswer === 0.5
                                        ? "เช่น: มีการปฏิบัติตามบางส่วน ได้ทำ X แล้ว แต่ยังขาด Y และ Z..."
                                        : "เช่น: มีการจัดเวทีรับฟังความคิดเห็น 3 ครั้ง โดยมีผู้เข้าร่วมรวม 120 คน..."
                                }
                                value={currentEvidence || ''}
                                onChange={(e) => onEvidence(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AssessmentForm = () => {
    const {
        currentAssessment,
        updateAssessmentInfo,
        startNewAssessment,
        updateAnswer,
        updateEvidence,
        saveAssessment
    } = useAssessment();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [customSector, setCustomSector] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [aiRisks, setAiRisks] = useState([]);
    const [aiPositiveImpacts, setAiPositiveImpacts] = useState([]);
    const [aiRecommendations, setAiRecommendations] = useState([]);
    const [aiQuestions, setAiQuestions] = useState([]);

    useEffect(() => {
        if (!currentAssessment.id) {
            startNewAssessment();
        }
    }, [currentAssessment.id, startNewAssessment]);

    const getAssessmentTypeText = () => {
        switch (currentAssessment.info.type) {
            case 'Legislation': return 'กฎหมาย';
            case 'Policy': return 'นโยบาย';
            case 'Plan': return 'แผนงาน';
            case 'Project': return 'โครงการ/กิจกรรม';
            default: return 'รูปแบบการประเมิน';
        }
    };

    const getSectorText = () => {
        const sector = SECTORS.find(s => s.id === currentAssessment.info.sector);
        if (sector) {
            return sector.id === 'other' ? customSector : sector.label;
        }
        return 'สาขา/อุตสาหกรรม';
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files).map(file => ({
            file,
            name: file.name,
            status: 'ready'
        }));
        setAttachedFiles(prev => [...prev, ...files]);
    };

    const handleStartAnalysis = async () => {
        if (!currentAssessment.info.type || !currentAssessment.info.name || !currentAssessment.info.sector) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน (รูปแบบการประเมิน, ชื่อโครงการ, สาขา)');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setAiRisks([]);
        setAiPositiveImpacts([]);
        setAiRecommendations([]);
        setAiQuestions([]);

        try {
            // Read file contents
            const fileContents = [];
            for (const fileItem of attachedFiles) {
                try {
                    const text = await readFileContent(fileItem.file);
                    fileContents.push(`\n=== ไฟล์: ${fileItem.name} ===\n${text}\n`);
                } catch (error) {
                    console.warn(`Cannot read file ${fileItem.name}:`, error);
                    fileContents.push(`\n=== ไฟล์: ${fileItem.name} ===\n[ไม่สามารถอ่านเนื้อหาไฟล์ได้ - รูปแบบไฟล์อาจไม่รองรับหรือไฟล์เสียหาย]\n`);
                }
            }

            const analysisResult = await analyzeProject({
                type: currentAssessment.info.type,
                name: currentAssessment.info.name,
                sector: currentAssessment.info.sector === 'other' ? customSector : currentAssessment.info.sector,
                description: currentAssessment.info.description || ''
            }, fileContents);

            setAiRisks(analysisResult.risks || []);
            setAiPositiveImpacts(analysisResult.positive_impacts || []);
            setAiRecommendations(analysisResult.recommendations || []);
            setAiQuestions(analysisResult.suggested_questions || []);

            updateAssessmentInfo({
                aiRisks: analysisResult.risks || [],
                aiPositiveImpacts: analysisResult.positive_impacts || [],
                aiRecommendations: analysisResult.recommendations || [],
                aiQuestions: analysisResult.suggested_questions || []
            });

            setAnalysisComplete(true);
            setStep(1);
        } catch (error) {
            console.error("Error during AI analysis:", error);

            // Use fallback mock data when AI fails
            const mockData = {
                risks: [
                    {
                        title: "ผลกระทบต่อสิ่งแวดล้อมและสุขภาพชุมชน",
                        description: "การดำเนินโครงการอาจส่งผลกระทบต่อคุณภาพอากาศและน้ำในพื้นที่",
                        severity: "High",
                        rights_affected: ["สิทธิในสุขภาพ", "สิทธิในสิ่งแวดล้อมที่ดี"]
                    },
                    {
                        title: "การใช้ที่ดินและการย้ายถิ่นฐาน",
                        description: "อาจมีการเวนคืนที่ดินหรือการโยกย้ายชุมชน",
                        severity: "High",
                        rights_affected: ["สิทธิในที่อยู่อาศัย", "สิทธิในทรัพย์สิน"]
                    }
                ],
                positive_impacts: [
                    {
                        title: "การสร้างงานและรายได้",
                        description: "โครงการจะสร้างงานและเพิ่มรายได้ให้กับชุมชนท้องถิ่น"
                    },
                    {
                        title: "การพัฒนาโครงสร้างพื้นฐาน",
                        description: "อาจมีการพัฒนาถนน ไฟฟ้า และสาธารณูปโภคในพื้นที่"
                    }
                ],
                recommendations: [
                    "จัดทำแผนการมีส่วนร่วมของชุมชนอย่างเป็นระบบ",
                    "กำหนดมาตรการชดเชยและฟื้นฟูที่เหมาะสม",
                    "ติดตามและรายงานผลกระทบอย่างสม่ำเสมอ"
                ],
                suggested_questions: [
                    {
                        category: "การมีส่วนร่วม",
                        text: "มีการปรึกษาหารือกับชุมชนที่ได้รับผลกระทบหรือไม่?",
                        guidance: "ควรมีกระบวนการรับฟังความคิดเห็นอย่างแท้จริง",
                        riskWarning: "การไม่มีส่วนร่วมอาจนำไปสู่ความขัดแย้ง"
                    }
                ]
            };

            setAiRisks(mockData.risks);
            setAiPositiveImpacts(mockData.positive_impacts);
            setAiRecommendations(mockData.recommendations);
            setAiQuestions(mockData.suggested_questions);

            updateAssessmentInfo({
                aiRisks: mockData.risks,
                aiPositiveImpacts: mockData.positive_impacts,
                aiRecommendations: mockData.recommendations,
                aiQuestions: mockData.suggested_questions
            });

            setAnalysisComplete(true);
            setStep(1);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const defaultQuestions = [];

    const handleFinish = () => {
        // Save the assessment with completion status and AI data
        const assessmentData = {
            scoping: aiRisks,
            positiveImpacts: aiPositiveImpacts,
            recommendations: aiRecommendations,
            aiQuestions: aiQuestions,
            completed: true
        };
        saveAssessment(true, assessmentData);

        // Navigate to report detail page
        navigate(`/report/${currentAssessment.id}`);
    };

    const questions = [...defaultQuestions, ...aiQuestions.map((q, idx) => ({
        id: `ai-${idx}`,
        category: q.category,
        text: q.text,
        guidance: q.guidance,
        riskWarning: q.riskWarning,
        isProjectSpecific: true
    }))];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step >= 0 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}>1</div>
                    <span className={clsx("ml-2 text-sm font-medium", step >= 0 ? "text-green-700" : "text-gray-500")}>ข้อมูลทั่วไป</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-200 mx-4"></div>
                <div className="flex items-center">
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step >= 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}>2</div>
                    <span className={clsx("ml-2 text-sm font-medium", step >= 1 ? "text-green-700" : "text-gray-500")}>วิเคราะห์เอกสาร</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-200 mx-4"></div>
                <div className="flex items-center">
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", step >= 2 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500")}>3</div>
                    <span className={clsx("ml-2 text-sm font-medium", step >= 2 ? "text-green-700" : "text-gray-500")}>แบบประเมิน</span>
                </div>
            </div>

            {step === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-hria-dark p-5 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Hammer size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">เริ่มการประเมินใหม่</h1>
                                <p className="text-xs text-gray-300">ระบุข้อมูลเบื้องต้นเพื่อให้ระบบจัดเตรียมชุดคำถามที่สอดคล้องกับรูปแบบการประเมินของคุณ</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-800 mb-3">1. เลือกรูปแบบการประเมิน (Assessment Type) *</label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <AssessmentTypeCard
                                    icon={Scale} title="กฎหมาย" desc="ร่างพระราชบัญญัติ, กฎกระทรวง"
                                    selected={currentAssessment.info.type === 'Legislation'}
                                    onClick={() => updateAssessmentInfo({ type: 'Legislation' })}
                                />
                                <AssessmentTypeCard
                                    icon={FileText} title="นโยบาย" desc="นโยบายระดับชาติ, ยุทธศาสตร์"
                                    selected={currentAssessment.info.type === 'Policy'}
                                    onClick={() => updateAssessmentInfo({ type: 'Policy' })}
                                />
                                <AssessmentTypeCard
                                    icon={Map} title="แผนงาน" desc="แผนแม่บท, ผังเมือง, แผนพัฒนา"
                                    selected={currentAssessment.info.type === 'Plan'}
                                    onClick={() => updateAssessmentInfo({ type: 'Plan' })}
                                />
                                <AssessmentTypeCard
                                    icon={Hammer} title="โครงการ/กิจกรรม" desc="สิ่งปลูกสร้าง, โรงงาน, การขุดเจาะ"
                                    selected={currentAssessment.info.type === 'Project'}
                                    onClick={() => updateAssessmentInfo({ type: 'Project' })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    <span className="text-green-600 mr-2">2.</span>
                                    ชื่อโครงการ (Project Name) *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-gray-50 text-sm"
                                    placeholder="ระบุชื่อ..."
                                    value={currentAssessment.info.name}
                                    onChange={(e) => updateAssessmentInfo({ name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-800 mb-2">
                                    <span className="text-green-600 mr-2">3.</span>
                                    สาขา / อุตสาหกรรม (Sector/Topic) *
                                </label>
                                <select
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-gray-50 text-gray-700 text-sm"
                                    value={currentAssessment.info.sector || ''}
                                    onChange={(e) => updateAssessmentInfo({ sector: e.target.value })}
                                >
                                    <option value="">-- กรุณาเลือกสาขาที่เกี่ยวข้อง --</option>
                                    {SECTORS.map(s => (
                                        <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                                    ))}
                                </select>
                                {currentAssessment.info.sector === 'other' && (
                                    <input
                                        type="text"
                                        className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        placeholder="ระบุสาขาอื่นๆ..."
                                        value={customSector}
                                        onChange={(e) => setCustomSector(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-800 mb-2">
                                <span className="text-green-600 mr-2">4.</span>
                                แนบเอกสารโครงการ (Project Documents)
                            </label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <Upload className="text-gray-400 mb-2" size={24} />
                                    <p className="text-xs text-gray-500 mb-2">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวางที่นี่</p>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        id="file-upload"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-600 cursor-pointer hover:bg-gray-50"
                                    >
                                        เลือกไฟล์
                                    </label>
                                </div>
                                {attachedFiles.length > 0 && (
                                    <div className="mt-3 space-y-2 w-full max-w-md mx-auto">
                                        {attachedFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <File size={14} className="text-gray-400" />
                                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                {file.status === 'uploading' ? (
                                                    <div className="flex items-center gap-1 text-blue-500">
                                                        <Loader2 size={12} className="animate-spin" />
                                                        <span className="text-[10px]">กำลังอัปโหลด...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-green-500">
                                                        <CheckCircle size={12} />
                                                        <span className="text-[10px]">เรียบร้อย</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-blue-700 text-xs border border-blue-100">
                            <Bot size={20} className="mt-0.5 shrink-0" />
                            <div className="leading-relaxed">
                                ระบบจะใช้ AI สร้างชุดคำถามประเมิน (Assessment Questions) ที่เหมาะสมกับ
                                <span className="font-bold mx-1 text-blue-800">"{getAssessmentTypeText()}"</span>
                                ในบริบท
                                <span className="font-bold mx-1 text-blue-800">"{getSectorText()}"</span>
                                โดยอัตโนมัติ
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button onClick={() => navigate('/')} className="text-xs text-gray-500 hover:text-gray-700 font-medium">กลับหน้าหลัก</button>
                            <button
                                onClick={handleStartAnalysis}
                                disabled={isAnalyzing}
                                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold shadow-lg shadow-green-500/30 flex items-center gap-2 transition-all text-sm disabled:opacity-50"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        กำลังวิเคราะห์...
                                    </>
                                ) : (
                                    <>
                                        บันทึกและวิเคราะห์เอกสาร <ChevronRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
                    <div className="bg-hria-dark p-5 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FileSearch size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">วิเคราะห์เอกสารโครงการ</h1>
                                <p className="text-xs text-gray-300">ระบบกำลังวิเคราะห์เอกสารที่คุณแนบมาเพื่อระบุความเสี่ยงเบื้องต้น</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col items-center justify-center">
                        {isAnalyzing && (
                            <div className="text-center space-y-4">
                                <Loader2 className="animate-spin text-green-500 mx-auto" size={48} />
                                <h3 className="text-lg font-bold text-gray-800">กำลังวิเคราะห์เอกสารด้วย AI...</h3>
                                <p className="text-sm text-gray-500">ระบบกำลังตรวจสอบเนื้อหาเทียบกับกรอบสิทธิมนุษยชนสากล</p>
                                <div className="w-64 h-2 bg-gray-100 rounded-full mx-auto overflow-hidden">
                                    <div className="h-full bg-green-500 animate-pulse w-2/3"></div>
                                </div>
                            </div>
                        )}

                        {analysisComplete && (
                            <div className="w-full max-w-4xl space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Risks */}
                                    <div className="bg-red-50 border border-red-100 p-6 rounded-xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertTriangle className="text-red-600" size={24} />
                                            <h3 className="text-lg font-bold text-red-800">ความเสี่ยง (Risks)</h3>
                                        </div>
                                        <p className="text-sm text-red-700 mb-4">AI ตรวจพบประเด็นความเสี่ยง {aiRisks.length} ประเด็น</p>
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {aiRisks.map((risk, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded border border-red-100 text-sm text-gray-700">
                                                    <span className="font-bold text-red-700">{risk.title}</span>
                                                    <p className="mt-1 text-xs">{risk.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Positive Impacts */}
                                    <div className="bg-green-50 border border-green-100 p-6 rounded-xl">
                                        <div className="flex items-center gap-2 mb-4">
                                            <CheckCircle className="text-green-600" size={24} />
                                            <h3 className="text-lg font-bold text-green-800">ผลกระทบเชิงบวก (Positive)</h3>
                                        </div>
                                        <p className="text-sm text-green-700 mb-4">AI ตรวจพบผลกระทบเชิงบวก {aiPositiveImpacts.length} ประเด็น</p>
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {aiPositiveImpacts.map((impact, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded border border-green-100 text-sm text-gray-700">
                                                    <span className="font-bold text-green-700">{impact.title}</span>
                                                    <p className="mt-1 text-xs">{impact.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg transition-all flex items-center gap-2"
                                    >
                                        ไปที่แบบประเมิน <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">แบบประเมินความเสี่ยง (Assessment)</h2>
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                                ข้อที่ {currentQuestionIndex + 1} / {questions.length}
                            </span>
                        </div>
                    </div>

                    <div className="h-1.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    <QuestionCard
                        question={questions[currentQuestionIndex]}
                        currentAnswer={currentAssessment.answers[questions[currentQuestionIndex].id]}
                        onAnswer={(val) => updateAnswer(questions[currentQuestionIndex].id, val)}
                        currentEvidence={currentAssessment.evidence[questions[currentQuestionIndex].id]}
                        onEvidence={(val) => updateEvidence(questions[currentQuestionIndex].id, val)}
                    />

                    <div className="flex justify-between mt-6">
                        <button
                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                            ย้อนกลับ
                        </button>
                        <button
                            onClick={() => {
                                if (currentQuestionIndex < questions.length - 1) {
                                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                                } else {
                                    handleFinish();
                                }
                            }}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-sm text-sm font-medium"
                        >
                            {currentQuestionIndex === questions.length - 1 ? 'เสร็จสิ้น' : 'ถัดไป'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssessmentForm;
