import { useState } from "react";
import { Header } from "./components/header";
import { ProgressStepper } from "./components/progress-stepper";
import { QuestionBankSelector } from "./components/question-bank-selector";
import { QuestionTypeSelector } from "./components/question-type-selector";
import { QuickPreview } from "./components/quick-preview";
import { TipsPanel } from "./components/tips-panel";
import { MultipleChoiceEditor } from "./components/multiple-choice-editor";
import { EssayEditor } from "./components/essay-editor";
import { AdditionalInfoSection } from "./components/additional-info-section";
import { Button } from "@/components/ui/button";
import { IQuestionForm } from "@/services/modules/question/interfaces/question.interface";
import httpService from "@/services/httpService";
import { showError, showSuccess } from "@/helpers/toast";
import questionService from "@/services/modules/question/question.service";
import { essay, multipleChoice } from "@/consts/common";
import { SavedQuestionsList } from "./components/saved-questions-list";
import QuestionContentEditor from "./components/question-content-editor";
import amazonServices from "@/services/modules/amazon/amazon.Services";

export default function QuestionManagement() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedQuestionType, setSelectedQuestionType] = useState("multiple-choice");
  const [questionContent, setQuestionContent] = useState("");
  const [imageupload, setImageUpload] = useState<File>()
  const token = httpService.getTokenStorage();
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([
    { id: "option-1", text: "", isCorrect: true },
    { id: "option-2", text: "", isCorrect: false },
    { id: "option-3", text: "", isCorrect: false },
    { id: "option-4", text: "", isCorrect: false },
  ]);

  // Essay state
  const [essayGuidance, setEssayGuidance] = useState("");

  // Additional info state
  const [difficulty, setDifficulty] = useState(1);
  const [subject, setSubject] = useState("");
  const [points, setPoints] = useState(1);
  const [explanation, setExplanation] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tag, setTag] = useState("");
  const steps = [
    {
      id: 1,
      title: "Tạo câu hỏi",
      completed: false,
      current: currentStep === 1,
    },
    {
      id: 2,
      title: "Cấu hình câu hỏi",
      completed: false,
      current: currentStep === 2,
    },
    // {
    //   id: 3,
    //   title: "Xem trước",
    //   completed: false,
    //   current: currentStep === 3,
    // },
    {
      id: 3,
      title: `Đã lưu gần đây`,
      completed: false,
      current: currentStep === 3,
    },
  ];

  const canProceedFromStep1 = selectedBank && questionContent.trim().length > 0;

  const canProceedFromStep2 = () => {
    if (!subject || points <= 0) {
      return false;
    }
    switch (selectedQuestionType) {
      case multipleChoice:
        return multipleChoiceOptions.every((option) => option.text.trim().length > 0);
      case essay:
        return true; // Essay doesn't require guidance
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedFromStep1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedFromStep2()) {
      addNewQuestion()
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep2Content = () => {
    switch (selectedQuestionType) {
      case multipleChoice:
        return <MultipleChoiceEditor options={multipleChoiceOptions} onOptionsChange={setMultipleChoiceOptions} />;
      case essay:
        return <EssayEditor guidance={essayGuidance} onGuidanceChange={setEssayGuidance} />;
      default:
        return null;
    }
  };

  const addNewQuestion = async () => {
    try {
      httpService.attachTokenToHeader(token);
      let imgUrl = null
      if (imageupload) {
        const formUpload = new FormData()
        formUpload.append('file', imageupload)
        const response = await amazonServices.uploadImg(formUpload)
        imgUrl = response.data.fileUrl
      }
      const newQuestion: IQuestionForm = {
        questionBankId: selectedBank,
        subjectId: subject,
        content: questionContent,
        type: selectedQuestionType === essay ? 0 : selectedQuestionType === multipleChoice ? 1 : 2,
        difficultLevel: difficulty,
        point: points,
        options: multipleChoiceOptions.map(op => op.text) ?? [],
        correctAnswer: selectedQuestionType === essay
          ? "không có"
          : selectedQuestionType === multipleChoice
            ? multipleChoiceOptions.find(op => op.isCorrect === true)?.text ?? ""
            : "",
        explanation: explanation,
        objectFile: imgUrl,
        tags: tag,
        description: "string"
      }
      // console.log(newQuestion);
      const formData = new FormData()
      formData.append('questionBankId', newQuestion.questionBankId);
      formData.append('subjectId', newQuestion.subjectId);
      formData.append('content', newQuestion.content);
      formData.append('type', newQuestion.type.toString());
      formData.append('difficultLevel', newQuestion.difficultLevel.toString());
      formData.append('point', newQuestion.point.toString());
      // formData.append('options', JSON.stringify(newQuestion.options))
      newQuestion.options.forEach((option, index) => {
        formData.append(`options[${index}]`, option);
      });
      formData.append('correctAnswer', newQuestion.correctAnswer);
      formData.append('explanation', newQuestion.explanation);
      formData.append('objectFile', newQuestion.objectFile);
      formData.append('tags', newQuestion.tags);
      formData.append('description', newQuestion.description);
      await questionService.addQuestion(formData);

      showSuccess("Thêm mới câu hỏi thành công");

    } catch (error) {
      showError(error);
    }
  }

  const handleCreateNew = () => {
    // Reset form
    setCurrentStep(1)
    setSelectedBank("")
    setSelectedQuestionType("multiple-choice")
    setQuestionContent("")
    setMultipleChoiceOptions([
      { id: "option-1", text: "", isCorrect: true },
      { id: "option-2", text: "", isCorrect: false },
      { id: "option-3", text: "", isCorrect: false },
      { id: "option-4", text: "", isCorrect: false },
    ])
    setEssayGuidance("")
    setDifficulty(1)
    setSubject("")
    setPoints(1)
    setExplanation("")
    setIsPublic(false)
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ProgressStepper steps={steps} />

      <div className="flex gap-6 p-6">
        <div className="flex-1 space-y-6">
          {currentStep === 1 ? (
            <>
              <QuestionBankSelector selectedBank={selectedBank} onBankChange={setSelectedBank} />
              <QuestionTypeSelector selectedType={selectedQuestionType} onTypeChange={setSelectedQuestionType} />
              <QuestionContentEditor
                content={questionContent}
                onContentChange={setQuestionContent}
                onNext={handleNext}
                canProceed={canProceedFromStep1}
                onImageUpload={setImageUpload}
              />
            </>
          ) : currentStep === 2 ? (
            <>
              {renderStep2Content()}
              <AdditionalInfoSection
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                subject={subject}
                onSubjectChange={setSubject}
                points={points}
                onPointsChange={setPoints}
                explanation={explanation}
                onExplanationChange={setExplanation}
                isPublic={isPublic}
                onPublicChange={setIsPublic}
                tag={tag}
                onTagChange={setTag}
              />
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Quay lại
                </Button>
                <div className="flex space-x-3">
                  <Button onClick={handleNext} disabled={!canProceedFromStep2()} className="bg-black text-white">
                    Lưu câu hỏi
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <SavedQuestionsList onCreateNew={handleCreateNew} />
          )}
        </div>

        {/* Right Panel */}
        {currentStep < 3 && (
          <div className="w-80 space-y-6">
            <QuickPreview selectedType={selectedQuestionType} content={questionContent} />
            <TipsPanel />
          </div>
        )}
      </div>
    </div>
  );
}