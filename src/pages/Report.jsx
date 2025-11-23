import React from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { Link } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';

const Reports = () => {
    const { assessments } = useAssessment();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Assessment Reports</h1>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                    <Download size={18} /> Export All
                </button>
            </div>

            {assessments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                    <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No reports available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {assessments.map((assessment) => (
                        <Link to={`/report/${assessment.id}`} key={assessment.id} className="block">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">{assessment.info.name || 'Untitled Assessment'}</h3>
                                    <p className="text-sm text-gray-500">{assessment.info.type} • {new Date(assessment.lastUpdated).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Risks Identified</p>
                                        <p className="font-bold text-gray-700">{assessment.scoping?.length || 0}</p>
                                    </div>
                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                                        <FileText size={20} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reports;
