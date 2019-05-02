{{- define "helm.name" -}}
{{-  .Values.environment | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "helm.fullname" -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
