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
import { SolenoidValveTemplate } from "./SolenoidValve/Template";
import { ElectricActuatorTemplate } from "./ElectricActuator/Template";
import { LimitSwitchTemplate } from "./LimitSwitch/Template";
import { WarrantyCertificateTemplate } from "./WarrantyCertificate/Template";
import { PneumaticActuatorTemplate } from "./PneumaticActuator/Template";

interface CertificateRendererProps {
  certificateType: CertificateType | string;
  data: AnyCertificateData | Record<string, unknown>;
  certificateNumber?: string;
  revision?: number;
  status?: string;
}

export const CertificateRenderer: React.FC<CertificateRendererProps> = ({
  certificateType,
  data,
  certificateNumber,
  revision = 0,
  status,
}) => {
  switch (certificateType) {
    case "electric-actuator":
      return (
        <ElectricActuatorTemplate
          data={data as ElectricActuatorCertificateData}
          certificateNumber={certificateNumber}
          revision={revision}
          status={status}
        />
      );

    case "limit-switch":
      return (
        <LimitSwitchTemplate
          data={data as LimitSwitchCertificateData}
          certificateNumber={certificateNumber}
          revision={revision}
          status={status}
        />
      );

    case "pneumatic-actuator":
      return (
        <PneumaticActuatorTemplate
          data={data as PneumaticActuatorCertificateData}
          certificateNumber={certificateNumber}
          revision={revision}
          status={status}
        />
      );

    case "warranty-certificate":
      return (
        <WarrantyCertificateTemplate
          data={data as WarrantyCertificateData}
          certificateNumber={certificateNumber}
          revision={revision}
          status={status}
        />
      );

    case "solenoid-valve":
    default:
      return (
        <SolenoidValveTemplate
          data={data as SolenoidValveCertificateData}
          certificateNumber={certificateNumber}
          revision={revision}
          status={status}
        />
      );
  }
};
