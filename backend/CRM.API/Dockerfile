FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Skopiuj cały backend do obrazu!
COPY .. ./

WORKDIR /app/CRM.API

RUN dotnet restore
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/CRM.API/out ./
EXPOSE 5167
ENTRYPOINT ["dotnet", "CRM.API.dll"]
