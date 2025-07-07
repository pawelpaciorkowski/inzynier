FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Skopiuj plik rozwiązania
COPY CRM.Solution.sln .

# Skopiuj resztę katalogu backend
COPY . ./

# Przywróć zależności dla całego rozwiązania
RUN dotnet restore CRM.Solution.sln

# Opublikuj projekt CRM.API
WORKDIR /app/CRM.API
RUN dotnet publish -c Release -o out /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/CRM.API/out ./
EXPOSE 5000
ENTRYPOINT ["dotnet", "CRM.API.dll"]
