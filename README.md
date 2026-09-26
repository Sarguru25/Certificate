
```
certificate
├─ README.md
├─ data
│  └─ data.json
├─ doc
│  ├─ 1.txt
│  ├─ 103 (4).xlsx
│  ├─ FTC.xlsx
│  ├─ Limit_Switch_Test_Report (1).xlsx
│  ├─ Solenoid_Valve_Test_Certificate(1).xlsx
│  ├─ WARRANTY CERTIFICATE.docx
│  ├─ WARRANTY CERTIFICATE.pdf
│  ├─ WhatsApp Image 2026-09-17 at 11.39.48 AM.jpeg
│  ├─ WhatsApp Image 2026-09-17 at 11.40.15 AM.jpeg
│  └─ electric actuatorTest.xlsx
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ Electric Actuator.png
│  ├─ Electric-Actuator.jpeg
│  ├─ Limit switch.png
│  ├─ Limit-Switch.jpg
│  ├─ Solenoid-Valve.jpeg
│  ├─ WARRANTY CERTIFICATE.png
│  ├─ pneumatic actuator.png
│  ├─ signature-karthikeyan.jpeg
│  ├─ signature-sivaganeshan.png
│  ├─ solenoid valve.png
│  └─ zeetork-logo.jpeg
├─ scripts
│  ├─ seed.ts
│  ├─ test-e2e.ts
│  ├─ test-pneumatic.ts
│  └─ test-warranty.ts
├─ src
│  ├─ app
│  │  ├─ (dashboard)
│  │  │  ├─ [certificateType]
│  │  │  │  ├─ [id]
│  │  │  │  │  ├─ edit
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ new
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ admin
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ roles
│  │  │  │  │  └─ page.tsx
│  │  │  │  └─ users
│  │  │  │     └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ reports
│  │  │     ├─ ReportsClient.tsx
│  │  │     └─ page.tsx
│  │  ├─ api
│  │  │  ├─ actuator-models
│  │  │  │  └─ route.ts
│  │  │  ├─ auth
│  │  │  │  ├─ login
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ logout
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ me
│  │  │  │     └─ route.ts
│  │  │  ├─ certificates
│  │  │  │  ├─ [id]
│  │  │  │  │  ├─ approve
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ clone
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ reject
│  │  │  │  │  │  └─ route.ts
│  │  │  │  │  ├─ route.ts
│  │  │  │  │  └─ submit
│  │  │  │  │     └─ route.ts
│  │  │  │  ├─ route.ts
│  │  │  │  └─ stats
│  │  │  │     └─ route.ts
│  │  │  ├─ roles
│  │  │  │  ├─ [id]
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  └─ users
│  │  │     ├─ [id]
│  │  │     │  └─ route.ts
│  │  │     └─ route.ts
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ login
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ CertificateForm.tsx
│  │  ├─ CertificatePreview.tsx
│  │  ├─ CertificateTable.tsx
│  │  ├─ SignatureSection.tsx
│  │  ├─ admin
│  │  │  ├─ RolesManager.tsx
│  │  │  └─ UsersManager.tsx
│  │  ├─ certificates
│  │  │  ├─ CertificateFormRenderer.tsx
│  │  │  ├─ CertificateRenderer.tsx
│  │  │  ├─ CertificateRowActions.tsx
│  │  │  ├─ CertificateTableRow.tsx
│  │  │  ├─ ElectricActuator
│  │  │  │  ├─ Form.tsx
│  │  │  │  └─ Template.tsx
│  │  │  ├─ LimitSwitch
│  │  │  │  ├─ Form.tsx
│  │  │  │  └─ Template.tsx
│  │  │  ├─ PneumaticActuator
│  │  │  │  ├─ Form.tsx
│  │  │  │  └─ Template.tsx
│  │  │  ├─ SolenoidValve
│  │  │  │  ├─ Form.tsx
│  │  │  │  ├─ Preview.tsx
│  │  │  │  └─ Template.tsx
│  │  │  ├─ WarrantyCertificate
│  │  │  │  ├─ Form.tsx
│  │  │  │  └─ Template.tsx
│  │  │  └─ common
│  │  │     ├─ ApprovalProgress.tsx
│  │  │     ├─ AuditTimeline.tsx
│  │  │     ├─ CertificateFooter.tsx
│  │  │     ├─ CertificateHeader.tsx
│  │  │     ├─ CustomFieldsEditor.tsx
│  │  │     └─ ResponsiveCertificatePreview.tsx
│  │  ├─ layout
│  │  │  ├─ AppHeader.tsx
│  │  │  ├─ AppSidebar.tsx
│  │  │  └─ UserNavMenu.tsx
│  │  └─ ui
│  │     ├─ ConfirmDialog.tsx
│  │     ├─ Modal.tsx
│  │     └─ StatusBadge.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ certificateDefaults.ts
│  │  ├─ certificateRegistry.ts
│  │  ├─ certificateValidation.ts
│  │  ├─ mongodb.ts
│  │  ├─ pdfGenerator.ts
│  │  ├─ permissions.ts
│  │  └─ validation
│  │     ├─ authSchema.ts
│  │     ├─ certificateSchema.ts
│  │     └─ userSchema.ts
│  ├─ models
│  │  ├─ ActuatorModel.ts
│  │  ├─ Certificate.ts
│  │  ├─ CertificateSequence.ts
│  │  ├─ Role.ts
│  │  └─ User.ts
│  ├─ services
│  │  ├─ actuatorModelService.ts
│  │  ├─ approvalService.ts
│  │  ├─ certificateNumberService.ts
│  │  ├─ certificateService.ts
│  │  └─ userService.ts
│  └─ types
│     ├─ auth.ts
│     ├─ certificate.ts
│     └─ user.ts
└─ tsconfig.json

```