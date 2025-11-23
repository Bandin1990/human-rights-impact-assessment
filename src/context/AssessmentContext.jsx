import React, { createContext, useContext, useState, useEffect } from 'react';

const AssessmentContext = createContext();

export const useAssessment = () => useContext(AssessmentContext);

export const AssessmentProvider = ({ children }) => {
    const [assessments, setAssessments] = useState(() => {
        const saved = localStorage.getItem('hria_assessments');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentAssessment, setCurrentAssessment] = useState({
        id: null,
        info: {
            name: '',
            type: '',
            description: '',
            owner: '',
        },
        answers: {}, // Map question ID to answer (true/false)
        evidence: {}, // Map question ID to evidence text
        completed: false,
        lastUpdated: null
    });

    useEffect(() => {
        localStorage.setItem('hria_assessments', JSON.stringify(assessments));
    }, [assessments]);

    const startNewAssessment = () => {
        setCurrentAssessment({
            id: Date.now(),
            info: { name: '', type: '', description: '', owner: '' },
            answers: {},
            evidence: {},
            completed: false,
            lastUpdated: new Date().toISOString()
        });
    };

    const updateAssessmentInfo = (info) => {
        setCurrentAssessment(prev => ({ ...prev, info: { ...prev.info, ...info } }));
    };

    const updateAnswer = (questionId, answer) => {
        setCurrentAssessment(prev => ({
            ...prev,
            answers: { ...prev.answers, [questionId]: answer }
        }));
    };

    const updateEvidence = (questionId, text) => {
        setCurrentAssessment(prev => ({
            ...prev,
            evidence: { ...prev.evidence, [questionId]: text }
        }));
    };

    const saveAssessment = (completed = false, extraData = {}) => {
        setAssessments(prev => {
            const assessmentToSave = {
                ...currentAssessment,
                completed,
                lastUpdated: new Date().toISOString(),
                ...extraData
            };

            const existingIndex = prev.findIndex(a => a.id === currentAssessment.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = assessmentToSave;
                return updated;
            }
            return [...prev, assessmentToSave];
        });
        return currentAssessment.id;
    };

    const deleteAssessment = (id) => {
        setAssessments(prev => prev.filter(a => a.id !== id));
    };

    return (
        <AssessmentContext.Provider value={{
            assessments,
            currentAssessment,
            startNewAssessment,
            updateAssessmentInfo,
            updateAnswer,
            updateEvidence,
            saveAssessment,
            deleteAssessment
        }}>
            {children}
        </AssessmentContext.Provider>
    );
};
