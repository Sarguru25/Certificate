"use client";

import React from "react";
import {
  CertificateType,
  AnyCertificateData,
  SolenoidValveCertificateData,
  ElectricActuatorCertificateData,
  LimitSwitchCertificateData,
  WarrantyCertificateData,
  PneumaticActuatorCertificateData,
} from "@/types/certificate";
import { SolenoidValveForm } from "./SolenoidValve/Form";
import { ElectricActuatorForm } from "./ElectricActuator/Form";
import { LimitSwitchForm } from "./LimitSwitch/Form";
import { WarrantyCertificateForm } from "./WarrantyCertificate/Form";
import { PneumaticActuatorForm } from "./PneumaticActuator/Form";

interface CertificateFormRendererProps {
  certificateType: CertificateType | string;
  data: AnyCertificateData;
  onChange: (newData: AnyCertificateData) => void;
  errors: Record<string, string>;
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  submitLabel?: string;
}

export const CertificateFormRenderer: React.FC<CertificateFormRendererProps> = ({
  certificateType,
  data,
  onChange,
  errors,
  onSaveDraft,
  onSubmitForApproval,
  onCancel,
  isSaving,
  submitLabel,
}) => {
  switch (certificateType) {
    case "electric-actuator":
      return (
        <ElectricActuatorForm
          data={data as ElectricActuatorCertificateData}
          onChange={(val) => onChange(val)}
          errors={errors}
          onSaveDraft={onSaveDraft}
          onSubmitForApproval={onSubmitForApproval}
          onCancel={onCancel}
          isSaving={isSaving}
          submitLabel={submitLabel}
        />
      );

    case "limit-switch":
      return (
        <LimitSwitchForm
          data={data as LimitSwitchCertificateData}
          onChange={(val) => onChange(val)}
          errors={errors}
          onSaveDraft={onSaveDraft}
          onSubmitForApproval={onSubmitForApproval}
          onCancel={onCancel}
          isSaving={isSaving}
          submitLabel={submitLabel}
        />
      );

    case "pneumatic-actuator":
      return (
        <PneumaticActuatorForm
          data={data as PneumaticActuatorCertificateData}
          onChange={(val) => onChange(val)}
          errors={errors}
          onSaveDraft={onSaveDraft}
          onSubmitForApproval={onSubmitForApproval}
          onCancel={onCancel}
          isSaving={isSaving}
          submitLabel={submitLabel}
        />
      );

    case "warranty-certificate":
      return (
        <WarrantyCertificateForm
          data={data as WarrantyCertificateData}
          onChange={(val) => onChange(val)}
          errors={errors}
          onSaveDraft={onSaveDraft}
          onSubmitForApproval={onSubmitForApproval}
          onCancel={onCancel}
          isSaving={isSaving}
          submitLabel={submitLabel}
        />
      );

    case "solenoid-valve":
    default:
      return (
        <SolenoidValveForm
          data={data as SolenoidValveCertificateData}
          onChange={(val) => onChange(val)}
          errors={errors}
          onSaveDraft={onSaveDraft}
          onSubmitForApproval={onSubmitForApproval}
          onCancel={onCancel}
          isSaving={isSaving}
          submitLabel={submitLabel}
        />
      );
  }
};
