# escape=`
# See https://learn.microsoft.com/en-us/virtualization/windowscontainers/manage-docker/manage-windows-dockerfile#:~:text=CMD%20reference.-,Escape%20character,-In%20many%20cases for explaining the above
FROM python:3.9-windowsservercore-1809

WORKDIR /code_BiVAE
COPY . /code_BiVAE

# List here https://learn.microsoft.com/en-us/visualstudio/install/workload-component-id-vs-community?view=vs-2022&preserve-view=true. We may be able to prune this list slightly!С
RUN start-process -wait -filepath bin/vs_buildtools.exe -ArgumentList '--quiet --wait --norestart --nocache --installPath C:\BuildTools `
  --add Microsoft.VisualStudio.ComponentGroup.VC.Tools.142.x86.x64 `
  --add Microsoft.VisualStudio.Component.Windows10SDK.19041 `
  --add Microsoft.VisualStudio.Component.Windows10SDK `
  --add Microsoft.VisualStudio.Component.VC.CoreIde `
  --add Microsoft.VisualStudio.Component.VC.CMake.Project `
  --add Microsoft.VisualStudio.Component.VC.14.29.16.11.CLI.Support `
  --add Microsoft.VisualStudio.ComponentGroup.UWP.VC.v142'
RUN python -m pip install --upgrade pip setuptools wheel

RUN python -m pip install recommenders[examples]
RUN python -m pip install tensorflow
RUN python -m pip install fastapi
RUN python -m pip install uvicorn
RUN python -m pip install pydantic
RUN python -m pip install cornac
RUN python -m pip install torch