import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, subtext, status }) => {
    const statusColors = {
        warning: 'bg-red-50 text-red-600 border-red-100',
        caution: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        success: 'bg-green-50 text-green-600 border-green-100',
        neutral: 'bg-purple-50 text-purple-600 border-purple-100',
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <div className={`p-1.5 rounded-lg ${statusColors[status]}`}>
                    <Icon size={16} />
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-800 mb-0.5">{value}</div>
                {subtext && <div className="text-[10px] text-gray-400">{subtext}</div>}
            </div>
            {status === 'warning' && (
                <div className="mt-3 h-1 w-full bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[40%]"></div>
                </div>
            )}
        </div>
    );
};

const RiskItem = ({ title, description, tags }) => (
    <div className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-start gap-2.5">
            <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-red-500"></div>
            <div>
                <h4 className="font-bold text-gray-800 mb-0.5 text-xs">{title}</h4>
                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">{description}</p>
                <div className="flex gap-1.5">
                    {tags.map((tag, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] rounded border border-gray-200">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { assessments } = useAssessment();
    const navigate = useNavigate();

    // Get latest assessment with data
    const latestAssessment = useMemo(() => {
        const completed = assessments.filter(a => a.completed);
        if (completed.length === 0) return null;
        return completed.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))[0];
    }, [assessments]);

    // Calculate stats from real data
    const stats = useMemo(() => {
        const total = assessments.length;
        const completed = assessments.filter(a => a.completed).length;

        // Get total risks from latest assessment
        const risks = latestAssessment?.scoping?.length || 0;

        // Calculate score from latest assessment
        let score = 0;
        if (latestAssessment && latestAssessment.answers) {
            const totalQuestions = Object.keys(latestAssessment.answers).length;
            const totalScore = Object.values(latestAssessment.answers).reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
            score = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
        }

        return { total, completed, risks, score };
    }, [assessments, latestAssessment]);

    // Build radar chart from latest assessment data
    const radarData = useMemo(() => {
        if (!latestAssessment || !latestAssessment.aiQuestions || !latestAssessment.answers) {
            return [
                { subject: 'ด้านสิ่งแวดล้อม', score: 0 },
                { subject: 'ด้านสังคม', score: 0 },
                { subject: 'สิทธิมนุษยชน', score: 0 },
                { subject: 'กระบวนการและกฎหมาย', score: 0 },
                { subject: 'เศรษฐกิจ', score: 0 },
                { subject: 'สุขภาพ', score: 0 },
            ];
        }

        const categories = {};
        latestAssessment.aiQuestions.forEach((q, idx) => {
            const category = q.category || 'ทั่วไป';
            if (!categories[category]) {
                categories[category] = { total: 0, score: 0 };
            }
            categories[category].total++;

            // Use q.id if available, otherwise construct the ID used in AssessmentForm (ai-{idx})
            const questionId = q.id || `ai-${idx}`;
            const answer = latestAssessment.answers[questionId];

            if (typeof answer === 'number') {
                categories[category].score += answer;
            }
        });

        // If no categories, use default with completion rate
        if (Object.keys(categories).length === 0) {
            const completionRate = stats.score;
            return [
                { subject: 'ด้านสิ่งแวดล้อม', score: completionRate },
                { subject: 'ด้านสังคม', score: completionRate },
                { subject: 'สิทธิมนุษยชน', score: completionRate },
                { subject: 'กระบวนการและกฎหมาย', score: completionRate },
                { subject: 'เศรษฐกิจ', score: completionRate },
                { subject: 'สุขภาพ', score: completionRate },
            ];
        }

        return Object.entries(categories).map(([category, data]) => ({
            subject: category,
            score: data.total > 0 ? Math.round((data.score / data.total) * 100) : 0
        }));
    }, [latestAssessment, stats.score]);

    // Get top risks from latest assessment
    const topRisks = useMemo(() => {
        if (!latestAssessment || !latestAssessment.scoping) return [];
        return latestAssessment.scoping.slice(0, 3);
    }, [latestAssessment]);

    return (
        <div className="space-y-5">
            {/* No data message */}
            {!latestAssessment && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">ยังไม่มีการประเมินที่เสร็จสิ้น</h3>
                    <p className="text-sm text-blue-700 mb-4">เริ่มต้นสร้างการประเมินครั้งแรกของคุณ</p>
                    <Link to="/assess/new">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            สร้างการประเมินใหม่
                        </button>
                    </Link>
                </div>
            )}

            {latestAssessment && (
                <>
                    {/* Latest Assessment Banner */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-1">การประเมินล่าสุด</h3>
                                <p className="text-xl font-bold text-green-700">{latestAssessment.info.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {latestAssessment.info.type} • อัปเดตเมื่อ {new Date(latestAssessment.lastUpdated).toLocaleDateString('th-TH')}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/report/${latestAssessment.id}`)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <TrendingUp size={16} />
                                ดูรายงานฉบับเต็ม
                            </button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            icon={CheckCircle}
                            label="คะแนนความสอดคล้อง"
                            value={`${stats.score}%`}
                            subtext={stats.score < 70 ? "ต่ำกว่าเกณฑ์ที่ดี" : "อยู่ในเกณฑ์ที่ดี"}
                            status={stats.score < 70 ? "warning" : "success"}
                        />
                        <StatCard
                            icon={AlertCircle}
                            label="ความเสี่ยงที่พบ"
                            value={stats.risks}
                            subtext="จากการประเมินล่าสุด"
                            status={stats.risks > 3 ? "warning" : stats.risks > 0 ? "caution" : "success"}
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="การประเมินที่เสร็จสิ้น"
                            value={`${stats.completed}/${stats.total}`}
                            subtext="รายการทั้งหมด"
                            status="success"
                        />
                        <StatCard
                            icon={Clock}
                            label="ผลกระทบเชิงบวก"
                            value={latestAssessment.positiveImpacts?.length || 0}
                            subtext="ประเด็นที่ดี"
                            status="neutral"
                        />
                    </div>

                    {/* Main Content Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[500px]">
                        {/* Radar Chart - NOW USES REAL DATA FROM LATEST ASSESSMENT */}
                        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-green-100 rounded text-green-600">
                                    <Radar size={16} />
                                </div>
                                <h3 className="font-bold text-gray-800 text-sm">วิเคราะห์ผลกระทบรายด้าน (Impact Analysis)</h3>
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                        <PolarGrid stroke="#e5e7eb" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Project"
                                            dataKey="score"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fill="#34d399"
                                            fillOpacity={0.5}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-center text-gray-500 mt-2">
                                ข้อมูลจากการประเมิน: {latestAssessment.info.name}
                            </p>
                        </div>

                        {/* Risk List - NOW USES REAL DATA FROM LATEST ASSESSMENT */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-red-50/30">
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle size={16} />
                                    <h3 className="font-bold text-sm">จุดเสี่ยงและข้อบกพร่องที่พบ</h3>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">จากการประเมินล่าสุด</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-1">
                                {topRisks.length > 0 ? (
                                    topRisks.map((risk, idx) => (
                                        <RiskItem
                                            key={idx}
                                            title={risk.title}
                                            description={risk.description}
                                            tags={risk.rights_affected || [risk.severity || 'Medium']}
                                        />
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        ไม่พบความเสี่ยง
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-gray-100">
                                <button
                                    onClick={() => navigate(`/report/${latestAssessment.id}`)}
                                    className="w-full py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                                >
                                    ดูทั้งหมด
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
