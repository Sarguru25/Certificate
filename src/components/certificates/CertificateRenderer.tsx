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
  ValveFunctionalTestCertificateData,
} from "@/types/certificate";
import { SolenoidValveTemplate } from "./SolenoidValve/Template";
import { ElectricActuatorTemplate } from "./ElectricActuator/Template";
import { LimitSwitchTemplate } from "./LimitSwitch/Template";
import { WarrantyCertificateTemplate } from "./WarrantyCertificate/Template";
import { PneumaticActuatorTemplate } from "./PneumaticActuator/Template";
import { ValveFunctionalTestTemplate } from "./ValveFunctionalTest/Template";

interface CertificateRendererProps {
  certificateType: CertificateType | string;
  data: AnyCertificateData | Record<string, unknown>;
  certificateNumber?: string;
  revision?: number;
  status?: string;
  activePageIndex?: number;
  showAllPages?: boolean;
  onChange?: (newData: any) => void;
}

export const CertificateRenderer: React.FC<CertificateRendererProps> = ({
  certificateType,
  data,
  certificateNumber,
  revision = 0,
  status,
  activePageIndex,
  showAllPages = true,
  onChange,
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
          onChange={onChange}
        />
      );

    case "valve-functional-test":
      return (
        <ValveFunctionalTestTemplate
          data={data as ValveFunctionalTestCertificateData}
          certificateNumber={certificateNumber}
          revision={revision}
          status={status}
          activePageIndex={activePageIndex}
          showAllPages={showAllPages}
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
