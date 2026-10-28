---
applyTo: "**/*.cs,**/*.csproj,**/*.sln,**/*.razor,**/*.bicep"
---

# .NET and Azure conventions

- Target the current LTS .NET. `<Nullable>enable</Nullable>` and `<ImplicitUsings>enable</ImplicitUsings>` on.
- `record` for immutable DTOs and value objects; `class` for entities and services.
- One API style per project (Minimal APIs or controllers); endpoints grouped by feature, not by type.
- Dependency injection through `Microsoft.Extensions.DependencyInjection` with constructor injection. No service locator.
- Configuration through `IOptions<T>` bound from `appsettings*.json`, environment variables, and Key Vault. Never hardcode connection strings or keys.
- Data access: EF Core with migrations committed; Dapper for hot read paths; parameterized queries always. Cosmos DB documents keyed by a partition key chosen for the access pattern.
- Async end to end: `async`/`await`, a `CancellationToken` on public async methods, no `.Result` or `.Wait()`.
- Logging with `ILogger<T>` and structured message templates. No string interpolation inside log calls.
- Errors: exceptions for unexpected failures, result types for expected ones, `ProblemDetails` for API error responses.
- Tests: xUnit, `Method_Scenario_ExpectedResult`, Arrange/Act/Assert, NSubstitute or Moq for fakes, `WebApplicationFactory` for API integration tests, Testcontainers for real databases.
- Naming: PascalCase types and members, camelCase locals and parameters, `_camelCase` private fields, `I` prefix on interfaces, `Async` suffix on async methods.
- Infrastructure in Bicep (or Terraform where the project already uses it). Managed identity over keys. Key Vault references for secrets. One resource group per environment.
- Serverless on Azure Functions uses the isolated worker model.
