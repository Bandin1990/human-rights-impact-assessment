import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import {
    ArrowLeft, Download, Printer, AlertTriangle, CheckCircle,
    FileText, Info, Calendar, Target, Shield, TrendingUp, Activity
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


const ReportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { assessments } = useAssessment();
    const [showAllRisks, setShowAllRisks] = useState(false);

    const assessment = assessments.find(a => a.id === Number(id));

    if (!assessment) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-gray-700">ไม่พบรายงานการประเมิน</h2>
                <button
                    onClick={() => navigate('/reports')}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    กลับไปหน้ารายงานรวม
                </button>
            </div>
        );
    }

    const risks = assessment.scoping || [];
    const positiveImpacts = assessment.positiveImpacts || [];
    const recommendations = assessment.recommendations || [];

    // Calculate statistics from actual answers (3-point system)
    const totalQuestions = Object.keys(assessment.answers || {}).length;
    const passedQuestions = Object.values(assessment.answers || {}).filter(v => v === 1).length;
    const partialQuestions = Object.values(assessment.answers || {}).filter(v => v === 0.5).length;
    const failedQuestions = Object.values(assessment.answers || {}).filter(v => v === 0).length;

    // Calculate score percentage: (Sum of scores / Total questions) * 100
    const totalScore = Object.values(assessment.answers || {}).reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
    const completionRate = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    // Build dynamic radar chart from actual assessment questions
    const buildRadarData = () => {
        const categories = {};
        const questions = assessment.aiQuestions || [];

        questions.forEach((q, idx) => {
            const category = q.category || 'ทั่วไป';
            if (!categories[category]) {
                categories[category] = { total: 0, score: 0 };
            }
            categories[category].total++;
            // Use q.id if available, otherwise construct the ID used in AssessmentForm (ai-{idx})
            const questionId = q.id || `ai-${idx}`;
            const answer = assessment.answers?.[questionId];

            if (typeof answer === 'number') {
                categories[category].score += answer;
            }
        });

        // If no questions with categories, use default categories with completion rate
        if (Object.keys(categories).length === 0) {
            return [
                { subject: 'สุขภาพ', score: completionRate },
                { subject: 'สิ่งแวดล้อม', score: completionRate },
                { subject: 'ที่อยู่อาศัย', score: completionRate },
                { subject: 'การมีส่วนร่วม', score: completionRate },
                { subject: 'ทรัพย์สิน', score: completionRate },
            ];
        }

        return Object.entries(categories).map(([category, data]) => ({
            subject: category,
            score: data.total > 0 ? Math.round((data.score / data.total) * 100) : 0
        }));
    };

    const radarData = buildRadarData();

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('report-content');
        if (!element) {
            alert('ไม่พบเนื้อหารายงาน');
            return;
        }

        try {
            const opt = {
                margin: [10, 10],
                filename: `HRIA_Report_${assessment.info.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            const html2pdf = await import('html2pdf.js');

            // Generate PDF blob
            const pdfBlob = await html2pdf.default().set(opt).from(element).outputPdf('blob');

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = opt.filename;
            link.style.display = 'none';

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (err) {
            console.error('PDF generation error:', err);
            alert('ไม่สามารถสร้าง PDF ได้: ' + err.message);
        }
    };

    const handleExportWord = () => {
        try {
            // Create proper Word document HTML
            let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HRIA Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #1e40af; font-size: 24pt; }
        h2 { color: #059669; font-size: 18pt; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #e5e7eb; font-weight: bold; }
        .summary { margin: 15px 0; }
        .risk { background-color: #fee2e2; padding: 10px; margin: 5px 0; border-left: 4px solid #ef4444; }
        .recommendation { background-color: #f3e8ff; padding: 10px; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>${assessment.info.name}</h1>
    <p><strong>Type:</strong> ${assessment.info.type}</p>
    <p><strong>Date:</strong> ${new Date(assessment.lastUpdated).toLocaleDateString()}</p>
    
    <h2>Summary Statistics</h2>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Score</td><td>${completionRate}%</td></tr>
        <tr><td>Total Risks Found</td><td>${risks.length}</td></tr>
        <tr><td>Passed (Full)</td><td>${passedQuestions}/${totalQuestions}</td></tr>
        <tr><td>Partial</td><td>${partialQuestions}/${totalQuestions}</td></tr>
        <tr><td>Failed</td><td>${failedQuestions}</td></tr>
        <tr><td>Positive Impacts</td><td>${positiveImpacts.length}</td></tr>
    </table>
    
    <h2>Identified Risks (${risks.length})</h2>
    ${risks.map((risk, idx) => `
        <div class="risk">
            <strong>${idx + 1}. ${risk.title}</strong><br/>
            <em>Severity: ${risk.severity || 'Medium'}</em><br/>
            ${risk.description || ''}
        </div>
    `).join('')}
    
    ${positiveImpacts.length > 0 ? `
        <h2>Positive Impacts (${positiveImpacts.length})</h2>
        ${positiveImpacts.map((impact, idx) => `
            <div style="background-color: #d1fae5; padding: 10px; margin: 5px 0;">
                <strong>${idx + 1}. ${impact.title}</strong><br/>
                ${impact.description || ''}
            </div>
        `).join('')}
    ` : ''}
    
    ${recommendations.length > 0 ? `
        <h2>Recommendations (${recommendations.length})</h2>
        ${recommendations.map((rec, idx) => `
            <div class="recommendation">
                ${idx + 1}. ${rec}
            </div>
        `).join('')}
    ` : ''}
    
    <hr style="margin-top: 30px;"/>
    <p style="text-align: center; color: #666; font-size: 10pt;">
        Generated by HRIA Assessment Tool - ${new Date().toLocaleString()}
    </p>
</body>
</html>`;

            const blob = new Blob(['\ufeff', html], {
                type: 'application/msword;charset=utf-8'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `HRIA_Report_${assessment.info.name.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            console.log('Word document generated successfully');
        } catch (error) {
            console.error('Word generation error:', error);
            alert('Error generating Word: ' + error.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={20} /> กลับหน้ารวม
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                    >
                        <Printer size={18} /> พิมพ์
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                        <Download size={18} /> PDF
                    </button>
                    <button
                        onClick={handleExportWord}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                        <Download size={18} /> Word
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <div id="report-content" className="bg-white shadow-sm border border-gray-100 rounded-xl p-8 print:shadow-none print:border-none">
                {/* Title Section */}
                <div className="border-b border-gray-200 pb-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessment.info.name}</h1>
                            <div className="flex gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Target size={14} /> {assessment.info.type}</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(assessment.lastUpdated).toLocaleDateString('th-TH')}</span>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                            ประเมินเสร็จสิ้น
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm">คะแนนความสอดคล้อง</span>
                            <Activity className="text-green-600" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-green-700">{completionRate}%</p>
                        <p className="text-xs text-gray-500 mt-1">คะแนนรวม</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm">ความเสี่ยงพบ</span>
                            <AlertTriangle className="text-orange-600" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-orange-700">{risks.length}</p>
                        <p className="text-xs text-gray-500 mt-1">ประเด็น [ความเสี่ยงสูง]</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm">การประเมินเบื้องต้น</span>
                            <CheckCircle className="text-blue-600" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-blue-700">{passedQuestions}/{totalQuestions}</p>
                        <p className="text-xs text-gray-500 mt-1">ผ่าน (เต็ม 1 คะแนน)</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm">โอกาสการดำเนินงาน</span>
                            <TrendingUp className="text-purple-600" size={20} />
                        </div>
                        <p className="text-3xl font-bold text-purple-700">{positiveImpacts.length > 0 ? 'ดี' : 'ปานกลาง'}</p>
                        <p className="text-xs text-gray-500 mt-1">(ระดับความเหมาะสม)</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Left: Radar Chart - NOW USES REAL DATA */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield className="text-blue-600" /> วิเคราะห์ผลกระทบตามด้าน (Impact Analysis)
                        </h2>
                        <div className="flex items-center justify-center h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <PolarRadiusAxis
                                        angle={90}
                                        domain={[0, 100]}
                                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    />
                                    <Radar
                                        name="คะแนนการประเมิน"
                                        dataKey="score"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.5}
                                    />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-2">
                            กราฟแสดงคะแนนการประเมินจากผลการตอบคำถามจริง
                        </p>
                    </div>

                    {/* Right: Risk Summary */}
                    <div className="space-y-4">
                        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-red-800 flex items-center gap-2 text-lg">
                                    <AlertTriangle size={20} /> ชุดข้อยกเว้นคะแนนส่วนขั้นต่ำ
                                </h3>
                                <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                                    {risks.length} ประเด็น
                                </span>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {risks.slice(0, 10).map((risk, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-bold text-red-700 text-sm mb-1">{risk.title}</p>
                                                <p className="text-xs text-gray-600 leading-relaxed">{risk.description}</p>
                                                {risk.severity && (
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                                                        {risk.severity}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {risks.length > 10 && !showAllRisks && (
                                    <button
                                        onClick={() => setShowAllRisks(true)}
                                        className="w-full py-2 text-xs text-red-600 hover:bg-red-100 rounded transition-colors font-medium"
                                    >
                                        ดูทั้งหมด ({risks.length} ประเด็น)
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Positive Impacts Summary */}
                        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-green-800 flex items-center gap-2">
                                    <CheckCircle size={20} /> ผลกระทบเชิงบวก
                                </h3>
                                <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                    {positiveImpacts.length} ประเด็น
                                </span>
                            </div>
                            <div className="space-y-2">
                                {positiveImpacts.slice(0, 10).map((impact, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded border border-green-100 text-sm">
                                        <p className="font-bold text-green-700 mb-1">{impact.title}</p>
                                        <p className="text-xs text-gray-600">{impact.description}</p>
                                    </div>
                                ))}
                                {positiveImpacts.length === 0 && (
                                    <p className="text-center text-gray-400 text-sm py-4">ไม่พบข้อมูลผลกระทบเชิงบวก</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Risks Detail Section */}
                {showAllRisks && (
                    <div className="mb-10 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FileText className="text-orange-600" /> รายละเอียดความเสี่ยงทั้งหมด
                        </h2>
                        <div className="space-y-4">
                            {risks.map((risk, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-gray-800 text-lg">{idx + 1}. {risk.title}</h4>
                                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${risk.severity === 'High' ? 'bg-red-100 text-red-700' :
                                            risk.severity === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {risk.severity || 'Medium'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{risk.description}</p>
                                    {risk.rights_affected && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700 mb-2">สิทธิที่ได้รับผลกระทบ:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {risk.rights_affected.map((right, rIdx) => (
                                                    <span key={rIdx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100 font-medium">
                                                        {right}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations Section */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Info className="text-purple-600" /> ข้อเสนอแนะเพื่อการปรับปรุง (Recommendations)
                    </h2>
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                        {recommendations.length > 0 ? (
                            <ul className="space-y-3">
                                {recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                        <span className="flex-shrink-0 w-7 h-7 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span className="leading-relaxed pt-1">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500">ไม่มีข้อเสนอแนะเพิ่มเติม</p>
                        )}
                    </div>
                </div>

                {/* Assessment Summary */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">สรุปผลการประเมินตนเอง</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-gray-50 p-5 rounded-lg text-center border border-gray-200">
                            <p className="text-gray-500 text-sm mb-2">คำถามทั้งหมด</p>
                            <p className="text-3xl font-bold text-gray-800">{totalQuestions}</p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-lg text-center border border-green-200">
                            <p className="text-green-600 text-sm mb-2">ผ่าน / ปฏิบัติตาม</p>
                            <p className="text-3xl font-bold text-green-700">{passedQuestions}</p>
                        </div>
                        <div className="bg-red-50 p-5 rounded-lg text-center border border-red-200">
                            <p className="text-red-600 text-sm mb-2">ไม่ผ่าน / มีความเสี่ยง</p>
                            <p className="text-3xl font-bold text-red-700">{failedQuestions}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>รายงานนี้สร้างโดย HRIA Assessment Tool</p>
                    <p className="mt-1">วันที่สร้าง: {new Date().toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
            </div>
        </div>
    );
};

export default ReportDetail;
