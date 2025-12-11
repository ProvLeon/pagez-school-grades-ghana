
import { useState, useEffect } from "react";
import { useCommentOptions } from "@/hooks/useGradingSettings";
import { CommentOption, CommentType } from "@/types/gradingSettings";
import {
  defaultConductOptions,
  defaultAttitudeOptions,
  defaultInterestOptions,
  defaultTeacherCommentOptions,
} from "@/data/defaults";

export const useCommentOptionsManager = () => {
  const { data: existingCommentOptions = [] } = useCommentOptions();

  const [conductOptions, setConductOptions] = useState<CommentOption[]>([]);
  const [attitudeOptions, setAttitudeOptions] = useState<CommentOption[]>([]);
  const [interestOptions, setInterestOptions] = useState<CommentOption[]>([]);
  const [teacherCommentOptions, setTeacherCommentOptions] = useState<CommentOption[]>([]);

  // Load existing comment options
  useEffect(() => {
    const conductOpts = existingCommentOptions.filter(opt => opt.option_type === 'conduct');
    const attitudeOpts = existingCommentOptions.filter(opt => opt.option_type === 'attitude');
    const interestOpts = existingCommentOptions.filter(opt => opt.option_type === 'interest');
    const teacherOpts = existingCommentOptions.filter(opt => opt.option_type === 'teacher');

    setConductOptions(conductOpts.length > 0 ? conductOpts.map(opt => ({ id: opt.id, value: opt.option_value })) : defaultConductOptions);
    setAttitudeOptions(attitudeOpts.length > 0 ? attitudeOpts.map(opt => ({ id: opt.id, value: opt.option_value })) : defaultAttitudeOptions);
    setInterestOptions(interestOpts.length > 0 ? interestOpts.map(opt => ({ id: opt.id, value: opt.option_value })) : defaultInterestOptions);
    setTeacherCommentOptions(teacherOpts.length > 0 ? teacherOpts.map(opt => ({ id: opt.id, value: opt.option_value })) : defaultTeacherCommentOptions);
  }, [existingCommentOptions]);

  const addCommentOption = (type: CommentType) => {
    const newOption: CommentOption = {
      id: Date.now().toString(),
      value: ""
    };

    if (type === "conduct") {
      setConductOptions([...conductOptions, newOption]);
    } else if (type === "attitude") {
      setAttitudeOptions([...attitudeOptions, newOption]);
    } else if (type === "interest") {
      setInterestOptions([...interestOptions, newOption]);
    } else {
      setTeacherCommentOptions([...teacherCommentOptions, newOption]);
    }
  };

  const removeCommentOption = (type: CommentType, id: string) => {
    if (type === "conduct") {
      setConductOptions(conductOptions.filter(option => option.id !== id));
    } else if (type === "attitude") {
      setAttitudeOptions(attitudeOptions.filter(option => option.id !== id));
    } else if (type === "interest") {
      setInterestOptions(interestOptions.filter(option => option.id !== id));
    } else {
      setTeacherCommentOptions(teacherCommentOptions.filter(option => option.id !== id));
    }
  };

  const updateCommentOption = (type: CommentType, id: string, value: string) => {
    const updateFunction = (options: CommentOption[]) =>
      options.map(option => option.id === id ? { ...option, value } : option);

    if (type === "conduct") {
      setConductOptions(updateFunction(conductOptions));
    } else if (type === "attitude") {
      setAttitudeOptions(updateFunction(attitudeOptions));
    } else if (type === "interest") {
      setInterestOptions(updateFunction(interestOptions));
    } else {
      setTeacherCommentOptions(updateFunction(teacherCommentOptions));
    }
  };

  return {
    conductOptions,
    attitudeOptions,
    interestOptions,
    teacherCommentOptions,
    addCommentOption,
    removeCommentOption,
    updateCommentOption
  };
};
