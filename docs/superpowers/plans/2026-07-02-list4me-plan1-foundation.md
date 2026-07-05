# List4Me — Plan 1: Foundation + Categories

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap monorepo, wire up Auth0 authentication, household onboarding, and full CRUD for Categories (with subcategories, icons, configurable "completed" labels) on both backend and frontend.

**Architecture:** Vertical-slice backend (.NET 10 Minimal API + EF Core + Postgres), React+Vite+TS frontend with Auth0. Household-scoped multi-tenant with middleware-enforced isolation. Testcontainers Postgres for backend integration tests.

**Tech Stack:** .NET 10, EF Core 10, Npgsql, FluentValidation, Serilog, xUnit, Testcontainers, React 19, Vite, TypeScript, TanStack Query, React Router v7, Tailwind CSS, shadcn/ui, Auth0 SDK.

**End state:** A user can log in via Auth0, create or accept-invite a household, and CRUD categories with subcategories, icons, and per-category "completed" labels. Backend has integration tests including cross-household isolation. Default seed data populates.

**Related spec:** `docs/superpowers/specs/2026-07-02-list4me-design.md`

---

## File Structure (created by this plan)

```
List4Me/
├── README.md
├── .editorconfig
├── docker-compose.yml                # dev Postgres
├── pnpm-workspace.yaml               # monorepo workspaces
├── package.json                      # root scripts
│
├── backend/
│   ├── List4Me.sln
│   ├── src/List4Me.Api/
│   │   ├── List4Me.Api.csproj
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   ├── Dockerfile
│   │   ├── Domain/                   # entities
│   │   │   ├── Household.cs
│   │   │   ├── HouseholdMember.cs
│   │   │   ├── HouseholdInvite.cs
│   │   │   ├── Category.cs
│   │   │   ├── Product.cs
│   │   │   ├── FavoriteProduct.cs
│   │   │   ├── ListEntity.cs
│   │   │   ├── ListItem.cs
│   │   │   ├── ListTemplate.cs
│   │   │   └── ListTemplateItem.cs
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Migrations/           # generated
│   │   │   └── Seed/DefaultSeed.cs
│   │   ├── Auth/
│   │   │   ├── CurrentUser.cs
│   │   │   ├── HouseholdContext.cs
│   │   │   └── HouseholdContextMiddleware.cs
│   │   ├── Common/
│   │   │   ├── ValidationFilter.cs
│   │   │   ├── ProblemResponses.cs
│   │   │   └── Results.cs
│   │   ├── Features/
│   │   │   ├── Health/HealthEndpoints.cs
│   │   │   ├── Households/           # feature slice
│   │   │   │   ├── HouseholdEndpoints.cs
│   │   │   │   ├── HouseholdDtos.cs
│   │   │   │   ├── CreateHousehold.cs
│   │   │   │   ├── GetMyHousehold.cs
│   │   │   │   ├── UpdateHousehold.cs
│   │   │   │   ├── CreateInvite.cs
│   │   │   │   ├── GetInvite.cs
│   │   │   │   ├── AcceptInvite.cs
│   │   │   │   └── RemoveMember.cs
│   │   │   └── Categories/
│   │   │       ├── CategoryEndpoints.cs
│   │   │       ├── CategoryDtos.cs
│   │   │       ├── ListCategories.cs
│   │   │       ├── CreateCategory.cs
│   │   │       ├── UpdateCategory.cs
│   │   │       └── DeleteCategory.cs
│   │   └── Testing/TestEndpoints.cs  # only wired in Test env
│   │
│   └── tests/List4Me.Tests.Integration/
│       ├── List4Me.Tests.Integration.csproj
│       ├── Fixtures/
│       │   ├── PostgresFixture.cs
│       │   ├── ApiFactory.cs
│       │   ├── FakeJwtAuthHandler.cs
│       │   └── TestDataSeeder.cs
│       ├── HealthTests.cs
│       ├── HouseholdEndpointTests.cs
│       ├── HouseholdIsolationTests.cs
│       └── CategoryEndpointTests.cs
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── index.html
    ├── .env.local.example
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── router.tsx
    │   ├── lib/
    │   │   ├── api.ts
    │   │   ├── queryClient.ts
    │   │   └── icons.ts
    │   ├── auth/
    │   │   ├── AuthGate.tsx
    │   │   └── OnboardingHousehold.tsx
    │   ├── features/
    │   │   ├── household/
    │   │   │   ├── api.ts
    │   │   │   ├── HouseholdSettings.tsx
    │   │   │   └── InviteAcceptPage.tsx
    │   │   └── categories/
    │   │       ├── api.ts
    │   │       ├── types.ts
    │   │       ├── CategoryList.tsx
    │   │       ├── CategoryCard.tsx
    │   │       ├── CategoryEditor.tsx
    │   │       └── IconPicker.tsx
    │   ├── components/
    │   │   ├── BottomNav.tsx
    │   │   ├── PageShell.tsx
    │   │   └── ui/                   # shadcn generated
    │   └── styles/globals.css
    └── tests/unit/
        └── setup.ts
```

---

## Phase A — Repo bootstrap

### Task A1: Root workspace files

**Files:**
- Create: `README.md`
- Create: `.editorconfig`
- Create: `docker-compose.yml`
- Create: `pnpm-workspace.yaml`
- Create: `package.json`

- [ ] **Step 1: Create `README.md`**

```markdown
# List4Me

Kategorizált listakezelő háztartásoknak. Monorepo: `/backend` (.NET 10 Minimal API), `/frontend` (React + Vite + TS), `/e2e` (Playwright — later).

## Dev quickstart
```
docker compose up -d              # Postgres on 5432
cd backend && dotnet run --project src/List4Me.Api
cd frontend && pnpm install && pnpm dev
```

See `docs/superpowers/specs/2026-07-02-list4me-design.md`.
```

- [ ] **Step 2: Create `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 4
trim_trailing_whitespace = true

[*.{ts,tsx,js,jsx,json,yaml,yml,md,css,html}]
indent_size = 2

[*.cs]
indent_size = 4
```

- [ ] **Step 3: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: list4me-postgres
    environment:
      POSTGRES_USER: list4me
      POSTGRES_PASSWORD: list4me_dev
      POSTGRES_DB: list4me
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U list4me"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  pgdata:
```

- [ ] **Step 4: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "frontend"
```

- [ ] **Step 5: Create root `package.json`**

```json
{
  "name": "list4me",
  "private": true,
  "scripts": {
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "dotnet run --project backend/src/List4Me.Api",
    "db:up": "docker compose up -d postgres",
    "db:down": "docker compose down"
  }
}
```

- [ ] **Step 6: Start Postgres and verify**

Run: `docker compose up -d postgres`
Then: `docker exec list4me-postgres pg_isready -U list4me`
Expected: `list4me-postgres:5432 - accepting connections`

- [ ] **Step 7: Commit**

```bash
git add README.md .editorconfig docker-compose.yml pnpm-workspace.yaml package.json
git commit -m "chore: bootstrap monorepo (docker-compose Postgres + workspaces)"
```

---

### Task A2: Backend solution + Api project scaffold

**Files:**
- Create: `backend/List4Me.sln`
- Create: `backend/src/List4Me.Api/List4Me.Api.csproj`
- Create: `backend/src/List4Me.Api/Program.cs`
- Create: `backend/src/List4Me.Api/appsettings.json`
- Create: `backend/src/List4Me.Api/appsettings.Development.json`

- [ ] **Step 1: Scaffold solution and Api project**

```bash
mkdir -p backend/src backend/tests
cd backend
dotnet new sln -n List4Me
dotnet new webapi -n List4Me.Api -o src/List4Me.Api --use-minimal-apis --framework net10.0
dotnet sln add src/List4Me.Api/List4Me.Api.csproj
```

- [ ] **Step 2: Replace `Program.cs` with minimal starter**

Overwrite `backend/src/List4Me.Api/Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

public partial class Program { }
```

(`public partial class Program { }` is required so tests can reference it via `WebApplicationFactory<Program>`.)

- [ ] **Step 3: Simplify `appsettings.json`**

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedOrigin": "http://localhost:5173",
  "Auth0": {
    "Domain": "",
    "Audience": ""
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=list4me;Username=list4me;Password=list4me_dev"
  }
}
```

`appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

- [ ] **Step 4: Verify it builds and runs**

```bash
dotnet build backend/List4Me.sln
dotnet run --project backend/src/List4Me.Api --urls http://localhost:5000
```

In another terminal: `curl http://localhost:5000/health`
Expected: `{"status":"ok"}`

Stop server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "chore(backend): scaffold .NET 10 Minimal API with /health endpoint"
```

---

### Task A3: Backend NuGet packages

**Files:**
- Modify: `backend/src/List4Me.Api/List4Me.Api.csproj`

- [ ] **Step 1: Add packages**

From `backend/`:

```bash
cd src/List4Me.Api
dotnet add package Microsoft.EntityFrameworkCore --version 10.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 10.0.0
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 10.0.0
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 10.0.0
dotnet add package FluentValidation.AspNetCore --version 11.3.0
dotnet add package Serilog.AspNetCore --version 8.0.3
dotnet add package Serilog.Sinks.Console --version 6.0.0
```

- [ ] **Step 2: Install dotnet-ef tool locally**

From repo root:

```bash
cd backend
dotnet new tool-manifest
dotnet tool install dotnet-ef --version 10.0.0
```

Verify: `dotnet ef --version` → prints EF Core tools version.

- [ ] **Step 3: Verify build still passes**

```bash
dotnet build backend/List4Me.sln
```

Expected: `Build succeeded`.

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "chore(backend): add EF Core, Npgsql, JWT, FluentValidation, Serilog packages"
```

---

## Phase B — Backend foundation

### Task B1: Domain entities

**Files:**
- Create: `backend/src/List4Me.Api/Domain/Household.cs`
- Create: `backend/src/List4Me.Api/Domain/HouseholdMember.cs`
- Create: `backend/src/List4Me.Api/Domain/HouseholdInvite.cs`
- Create: `backend/src/List4Me.Api/Domain/Category.cs`
- Create: `backend/src/List4Me.Api/Domain/Product.cs`
- Create: `backend/src/List4Me.Api/Domain/FavoriteProduct.cs`
- Create: `backend/src/List4Me.Api/Domain/ListEntity.cs`
- Create: `backend/src/List4Me.Api/Domain/ListItem.cs`
- Create: `backend/src/List4Me.Api/Domain/ListTemplate.cs`
- Create: `backend/src/List4Me.Api/Domain/ListTemplateItem.cs`

- [ ] **Step 1: Create `Household.cs`**

```csharp
namespace List4Me.Api.Domain;

public class Household
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<HouseholdMember> Members { get; set; } = new List<HouseholdMember>();
}
```

- [ ] **Step 2: Create `HouseholdMember.cs`**

```csharp
namespace List4Me.Api.Domain;

public enum HouseholdRole { Owner, Member }

public class HouseholdMember
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public Household Household { get; set; } = null!;
    public string Auth0UserId { get; set; } = "";
    public HouseholdRole Role { get; set; }
    public string DisplayName { get; set; } = "";
    public DateTimeOffset JoinedAt { get; set; }
}
```

- [ ] **Step 3: Create `HouseholdInvite.cs`**

```csharp
namespace List4Me.Api.Domain;

public class HouseholdInvite
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public Household Household { get; set; } = null!;
    public string? Email { get; set; }
    public Guid Token { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public Guid CreatedByMemberId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
```

- [ ] **Step 4: Create `Category.cs`**

```csharp
namespace List4Me.Api.Domain;

public class Category
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public string Name { get; set; } = "";
    public string IconKey { get; set; } = "shopping-cart";
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public string CompletedLabel { get; set; } = "Kész";
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    public ICollection<Category> Subcategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
```

- [ ] **Step 5: Create `Product.cs`**

```csharp
namespace List4Me.Api.Domain;

public class Product
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = "";
    public decimal? DefaultQuantity { get; set; }
    public string? DefaultUnit { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
```

- [ ] **Step 6: Create `FavoriteProduct.cs`**

```csharp
namespace List4Me.Api.Domain;

public class FavoriteProduct
{
    public Guid HouseholdMemberId { get; set; }
    public HouseholdMember HouseholdMember { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
}
```

- [ ] **Step 7: Create `ListEntity.cs`** (named `ListEntity` because `List` conflicts with `System.Collections.Generic.List`)

```csharp
namespace List4Me.Api.Domain;

public class ListEntity
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = "";
    public Guid CreatedByMemberId { get; set; }
    public Guid? FromTemplateId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }

    public ICollection<ListItem> Items { get; set; } = new List<ListItem>();
}
```

- [ ] **Step 8: Create `ListItem.cs`**

```csharp
namespace List4Me.Api.Domain;

public class ListItem
{
    public Guid Id { get; set; }
    public Guid ListId { get; set; }
    public ListEntity List { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal? Quantity { get; set; }
    public string? Unit { get; set; }
    public DateOnly? ExpiresOn { get; set; }
    public string? Note { get; set; }
    public bool IsCompleted { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public Guid? CompletedByMemberId { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
```

- [ ] **Step 9: Create `ListTemplate.cs` and `ListTemplateItem.cs`**

```csharp
// ListTemplate.cs
namespace List4Me.Api.Domain;

public class ListTemplate
{
    public Guid Id { get; set; }
    public Guid HouseholdId { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = "";
    public Guid CreatedByMemberId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<ListTemplateItem> Items { get; set; } = new List<ListTemplateItem>();
}
```

```csharp
// ListTemplateItem.cs
namespace List4Me.Api.Domain;

public class ListTemplateItem
{
    public Guid Id { get; set; }
    public Guid TemplateId { get; set; }
    public ListTemplate Template { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public decimal? Quantity { get; set; }
    public string? Unit { get; set; }
    public string? Note { get; set; }
    public int SortOrder { get; set; }
}
```

- [ ] **Step 10: Verify build**

```bash
dotnet build backend/List4Me.sln
```

Expected: build succeeds (no runtime testing yet).

- [ ] **Step 11: Commit**

```bash
git add backend/src/List4Me.Api/Domain/
git commit -m "feat(backend): add domain entities (Household, Category, Product, List, Template)"
```

---

### Task B2: AppDbContext + entity configuration

**Files:**
- Create: `backend/src/List4Me.Api/Data/AppDbContext.cs`

- [ ] **Step 1: Create `AppDbContext.cs`**

```csharp
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Household> Households => Set<Household>();
    public DbSet<HouseholdMember> HouseholdMembers => Set<HouseholdMember>();
    public DbSet<HouseholdInvite> HouseholdInvites => Set<HouseholdInvite>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<FavoriteProduct> FavoriteProducts => Set<FavoriteProduct>();
    public DbSet<ListEntity> Lists => Set<ListEntity>();
    public DbSet<ListItem> ListItems => Set<ListItem>();
    public DbSet<ListTemplate> ListTemplates => Set<ListTemplate>();
    public DbSet<ListTemplateItem> ListTemplateItems => Set<ListTemplateItem>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Household>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(120);
        });

        mb.Entity<HouseholdMember>(e =>
        {
            e.Property(x => x.Auth0UserId).IsRequired().HasMaxLength(255);
            e.Property(x => x.DisplayName).HasMaxLength(120);
            e.Property(x => x.Role).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(x => x.Auth0UserId).IsUnique();
            e.HasIndex(x => x.HouseholdId);
            e.HasOne(x => x.Household).WithMany(h => h.Members)
                .HasForeignKey(x => x.HouseholdId).OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<HouseholdInvite>(e =>
        {
            e.Property(x => x.Email).HasMaxLength(255);
            e.HasIndex(x => x.Token).IsUnique();
            e.HasIndex(x => x.HouseholdId);
            e.HasOne(x => x.Household).WithMany()
                .HasForeignKey(x => x.HouseholdId).OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<Category>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(80);
            e.Property(x => x.IconKey).IsRequired().HasMaxLength(64);
            e.Property(x => x.CompletedLabel).IsRequired().HasMaxLength(40);
            e.HasIndex(x => new { x.HouseholdId, x.DeletedAt });
            e.HasIndex(x => x.ParentCategoryId);
            e.HasOne(x => x.ParentCategory).WithMany(c => c.Subcategories)
                .HasForeignKey(x => x.ParentCategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<Product>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(120);
            e.Property(x => x.DefaultQuantity).HasPrecision(12, 3);
            e.Property(x => x.DefaultUnit).HasMaxLength(20);
            e.HasIndex(x => new { x.CategoryId, x.DeletedAt });
            e.HasIndex(x => x.Name);
            e.HasOne(x => x.Category).WithMany(c => c.Products)
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<FavoriteProduct>(e =>
        {
            e.HasKey(x => new { x.HouseholdMemberId, x.ProductId });
            e.HasOne(x => x.HouseholdMember).WithMany()
                .HasForeignKey(x => x.HouseholdMemberId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        mb.Entity<ListEntity>(e =>
        {
            e.ToTable("Lists");
            e.Property(x => x.Name).IsRequired().HasMaxLength(120);
            e.HasIndex(x => new { x.HouseholdId, x.ArchivedAt, x.DeletedAt });
            e.HasOne(x => x.Category).WithMany()
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<ListItem>(e =>
        {
            e.Property(x => x.Quantity).HasPrecision(12, 3);
            e.Property(x => x.Unit).HasMaxLength(20);
            e.Property(x => x.Note).HasMaxLength(500);
            e.HasIndex(x => new { x.ListId, x.IsCompleted });
            e.HasOne(x => x.List).WithMany(l => l.Items)
                .HasForeignKey(x => x.ListId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<ListTemplate>(e =>
        {
            e.Property(x => x.Name).IsRequired().HasMaxLength(120);
            e.HasIndex(x => new { x.HouseholdId, x.CategoryId });
            e.HasOne(x => x.Category).WithMany()
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        mb.Entity<ListTemplateItem>(e =>
        {
            e.Property(x => x.Quantity).HasPrecision(12, 3);
            e.Property(x => x.Unit).HasMaxLength(20);
            e.Property(x => x.Note).HasMaxLength(500);
            e.HasOne(x => x.Template).WithMany(t => t.Items)
                .HasForeignKey(x => x.TemplateId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
```

- [ ] **Step 2: Wire DbContext in `Program.cs`**

Add after `builder.Services.AddOpenApi();`:

```csharp
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
```

Add using at top: `using List4Me.Api.Data;`

- [ ] **Step 3: Verify build**

```bash
dotnet build backend/List4Me.sln
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/List4Me.Api/
git commit -m "feat(backend): add AppDbContext with entity configurations and Npgsql wiring"
```

---

### Task B3: Initial migration

**Files:**
- Generated: `backend/src/List4Me.Api/Data/Migrations/*`

- [ ] **Step 1: Ensure dev Postgres is up**

```bash
docker compose up -d postgres
docker exec list4me-postgres pg_isready -U list4me
```

Expected: `accepting connections`.

- [ ] **Step 2: Generate initial migration**

From `backend/`:

```bash
dotnet ef migrations add InitialCreate --project src/List4Me.Api --output-dir Data/Migrations
```

Expected: migration files created under `Data/Migrations/`.

- [ ] **Step 3: Apply migration**

```bash
dotnet ef database update --project src/List4Me.Api
```

Expected: `Done.` Verify tables exist:

```bash
docker exec list4me-postgres psql -U list4me -d list4me -c "\dt"
```

Expected: Categories, Households, HouseholdInvites, HouseholdMembers, Lists, ListItems, ListTemplates, ListTemplateItems, Products, FavoriteProducts, __EFMigrationsHistory.

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat(backend): add initial EF Core migration"
```

---

### Task B4: Serilog logging

**Files:**
- Modify: `backend/src/List4Me.Api/Program.cs`

- [ ] **Step 1: Add Serilog bootstrap to `Program.cs`**

At the very top of `Program.cs`, replace the first lines with:

```csharp
using List4Me.Api.Data;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, cfg) =>
{
    cfg.MinimumLevel.Information()
       .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
       .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
       .Enrich.FromLogContext();

    if (ctx.HostingEnvironment.IsDevelopment())
        cfg.WriteTo.Console();
    else
        cfg.WriteTo.Console(new Serilog.Formatting.Compact.CompactJsonFormatter());
});
```

Add package for JSON formatter:

```bash
cd backend/src/List4Me.Api
dotnet add package Serilog.Formatting.Compact --version 3.0.0
```

- [ ] **Step 2: Add request logging middleware**

After `var app = builder.Build();`:

```csharp
app.UseSerilogRequestLogging();
```

- [ ] **Step 3: Verify run**

```bash
dotnet run --project backend/src/List4Me.Api --urls http://localhost:5000
```

Expected: startup logs formatted; hitting `/health` logs `HTTP GET /health responded 200`.

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat(backend): add Serilog console/JSON logging + request logging"
```

---

### Task B5: Auth0 JWT authentication

**Files:**
- Create: `backend/src/List4Me.Api/Auth/CurrentUser.cs`
- Modify: `backend/src/List4Me.Api/Program.cs`

- [ ] **Step 1: Create `CurrentUser.cs`**

```csharp
using System.Security.Claims;

namespace List4Me.Api.Auth;

/// <summary>Auth0 user identity (sub claim + email/name if present).</summary>
public record CurrentUser(string Auth0UserId, string? Email, string? DisplayName)
{
    public static CurrentUser FromPrincipal(ClaimsPrincipal p)
    {
        var sub = p.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? p.FindFirst("sub")?.Value
               ?? throw new InvalidOperationException("Missing sub claim");
        var email = p.FindFirst("email")?.Value ?? p.FindFirst(ClaimTypes.Email)?.Value;
        var name = p.FindFirst("name")?.Value ?? p.FindFirst(ClaimTypes.Name)?.Value ?? email;
        return new CurrentUser(sub, email, name);
    }
}
```

- [ ] **Step 2: Wire JWT bearer in `Program.cs`**

After `AddDbContext`:

```csharp
var auth0Domain = builder.Configuration["Auth0:Domain"];
var auth0Audience = builder.Configuration["Auth0:Audience"];

builder.Services
    .AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{auth0Domain}/";
        options.Audience = auth0Audience;
        options.TokenValidationParameters = new()
        {
            NameClaimType = "name",
            RoleClaimType = "https://list4me/roles"
        };
    });

builder.Services.AddAuthorization();
```

Add before `app.MapGet("/health", ...)`:

```csharp
app.UseAuthentication();
app.UseAuthorization();
```

- [ ] **Step 3: Verify build**

```bash
dotnet build backend/List4Me.sln
```

Expected: builds. (No runtime test yet — Auth0 tenant configured later.)

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat(backend): add Auth0 JWT bearer authentication"
```

---

### Task B6: HouseholdContext middleware

**Files:**
- Create: `backend/src/List4Me.Api/Auth/HouseholdContext.cs`
- Create: `backend/src/List4Me.Api/Auth/HouseholdContextMiddleware.cs`
- Modify: `backend/src/List4Me.Api/Program.cs`

- [ ] **Step 1: Create `HouseholdContext.cs`**

```csharp
using List4Me.Api.Domain;

namespace List4Me.Api.Auth;

/// <summary>
/// Resolved per-request: identifies the current user and, if they belong to a household,
/// exposes the HouseholdMember row so endpoints can scope queries.
/// </summary>
public class HouseholdContext
{
    public CurrentUser? User { get; set; }
    public HouseholdMember? Member { get; set; }

    public Guid RequireHouseholdId() =>
        Member?.HouseholdId ?? throw new InvalidOperationException("No household context");

    public Guid RequireMemberId() =>
        Member?.Id ?? throw new InvalidOperationException("No household context");
}
```

- [ ] **Step 2: Create `HouseholdContextMiddleware.cs`**

```csharp
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Auth;

public class HouseholdContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, AppDbContext db, HouseholdContext hc)
    {
        if (ctx.User.Identity?.IsAuthenticated == true)
        {
            var user = CurrentUser.FromPrincipal(ctx.User);
            hc.User = user;
            hc.Member = await db.HouseholdMembers
                .FirstOrDefaultAsync(m => m.Auth0UserId == user.Auth0UserId);
        }
        await next(ctx);
    }
}
```

- [ ] **Step 3: Register in `Program.cs`**

After `AddAuthorization()`:

```csharp
builder.Services.AddScoped<HouseholdContext>();
```

Add using: `using List4Me.Api.Auth;`

After `app.UseAuthorization()`:

```csharp
app.UseMiddleware<HouseholdContextMiddleware>();
```

- [ ] **Step 4: Verify build**

```bash
dotnet build backend/List4Me.sln
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): add HouseholdContext middleware (resolves member per request)"
```

---

### Task B7: Startup migration + health endpoint refactor

**Files:**
- Create: `backend/src/List4Me.Api/Features/Health/HealthEndpoints.cs`
- Modify: `backend/src/List4Me.Api/Program.cs`

- [ ] **Step 1: Create `HealthEndpoints.cs`**

```csharp
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Health;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealth(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health", async (AppDbContext db) =>
        {
            try
            {
                await db.Database.ExecuteSqlRawAsync("SELECT 1");
                return Results.Ok(new { status = "ok" });
            }
            catch (Exception ex)
            {
                return Results.Problem(ex.Message, statusCode: 503);
            }
        }).AllowAnonymous();
        return app;
    }
}
```

- [ ] **Step 2: Update `Program.cs`**

Remove the inline `/health` handler. Add:

```csharp
using List4Me.Api.Features.Health;
```

Add after middlewares:

```csharp
app.MapHealth();
```

Add startup migration after `var app = builder.Build();`:

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
```

- [ ] **Step 3: Run and verify**

```bash
dotnet run --project backend/src/List4Me.Api --urls http://localhost:5000
curl http://localhost:5000/health
```

Expected: `{"status":"ok"}` (200). Stop backend.

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat(backend): add DB-checking /health and startup EF Core migrate"
```

---

## Phase C — Backend test infrastructure

### Task C1: Integration test project scaffold

**Files:**
- Create: `backend/tests/List4Me.Tests.Integration/List4Me.Tests.Integration.csproj`

- [ ] **Step 1: Create test project**

```bash
cd backend
dotnet new xunit -n List4Me.Tests.Integration -o tests/List4Me.Tests.Integration --framework net10.0
dotnet sln add tests/List4Me.Tests.Integration/List4Me.Tests.Integration.csproj
```

- [ ] **Step 2: Reference API + test packages**

```bash
cd tests/List4Me.Tests.Integration
dotnet add reference ../../src/List4Me.Api/List4Me.Api.csproj
dotnet add package Microsoft.AspNetCore.Mvc.Testing --version 10.0.0
dotnet add package Testcontainers.PostgreSql --version 4.0.0
dotnet add package FluentAssertions --version 6.12.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 10.0.0
```

- [ ] **Step 3: Delete default `UnitTest1.cs`** if generated.

- [ ] **Step 4: Verify build**

```bash
dotnet build backend/List4Me.sln
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "test(backend): scaffold integration test project (Testcontainers + FluentAssertions)"
```

---

### Task C2: PostgresFixture + ApiFactory + FakeJwtAuthHandler

**Files:**
- Create: `backend/tests/List4Me.Tests.Integration/Fixtures/PostgresFixture.cs`
- Create: `backend/tests/List4Me.Tests.Integration/Fixtures/FakeJwtAuthHandler.cs`
- Create: `backend/tests/List4Me.Tests.Integration/Fixtures/ApiFactory.cs`

- [ ] **Step 1: Create `PostgresFixture.cs`**

```csharp
using Testcontainers.PostgreSql;
using Xunit;

namespace List4Me.Tests.Integration.Fixtures;

public class PostgresFixture : IAsyncLifetime
{
    public PostgreSqlContainer Container { get; } = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .WithDatabase("list4me_test")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public string ConnectionString => Container.GetConnectionString();

    public Task InitializeAsync() => Container.StartAsync();
    public Task DisposeAsync() => Container.DisposeAsync().AsTask();
}

[CollectionDefinition("Postgres")]
public class PostgresCollection : ICollectionFixture<PostgresFixture> { }
```

- [ ] **Step 2: Create `FakeJwtAuthHandler.cs`**

```csharp
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace List4Me.Tests.Integration.Fixtures;

public class FakeAuthOptions : AuthenticationSchemeOptions { }

public class FakeJwtAuthHandler(
    IOptionsMonitor<FakeAuthOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<FakeAuthOptions>(options, logger, encoder)
{
    public const string SchemeName = "FakeJwt";
    public const string UserHeader = "X-Test-User-Sub";
    public const string EmailHeader = "X-Test-User-Email";
    public const string NameHeader = "X-Test-User-Name";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(UserHeader, out var sub) || string.IsNullOrEmpty(sub))
            return Task.FromResult(AuthenticateResult.NoResult());

        var claims = new List<Claim> { new("sub", sub!) };
        if (Request.Headers.TryGetValue(EmailHeader, out var email))
            claims.Add(new Claim("email", email!));
        if (Request.Headers.TryGetValue(NameHeader, out var name))
            claims.Add(new Claim("name", name!));

        var identity = new ClaimsIdentity(claims, SchemeName);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
```

- [ ] **Step 3: Create `ApiFactory.cs`**

```csharp
using List4Me.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace List4Me.Tests.Integration.Fixtures;

public class ApiFactory(PostgresFixture pg) : WebApplicationFactory<Program>
{
    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.UseEnvironment("Test");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.AddDbContext<AppDbContext>(o => o.UseNpgsql(pg.ConnectionString));

            services.PostConfigureAll<AuthenticationOptions>(o =>
            {
                o.DefaultAuthenticateScheme = FakeJwtAuthHandler.SchemeName;
                o.DefaultChallengeScheme = FakeJwtAuthHandler.SchemeName;
            });
            services.AddAuthentication(FakeJwtAuthHandler.SchemeName)
                .AddScheme<FakeAuthOptions, FakeJwtAuthHandler>(FakeJwtAuthHandler.SchemeName, _ => { });
        });

        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureDeleted();
        db.Database.Migrate();

        return host;
    }

    public HttpClient CreateClientAs(string auth0UserId, string? email = null, string? name = null)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(FakeJwtAuthHandler.UserHeader, auth0UserId);
        if (email is not null) client.DefaultRequestHeaders.Add(FakeJwtAuthHandler.EmailHeader, email);
        if (name is not null) client.DefaultRequestHeaders.Add(FakeJwtAuthHandler.NameHeader, name);
        return client;
    }
}
```

Add import `using Microsoft.Extensions.DependencyInjection.Extensions;` for `RemoveAll`.

- [ ] **Step 4: Verify build**

```bash
dotnet build backend/List4Me.sln
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "test(backend): add PostgresFixture, ApiFactory, FakeJwtAuthHandler"
```

---

### Task C3: HealthTests (verify pipeline works)

**Files:**
- Create: `backend/tests/List4Me.Tests.Integration/HealthTests.cs`

- [ ] **Step 1: Write failing test**

```csharp
using System.Net;
using FluentAssertions;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class HealthTests(PostgresFixture pg)
{
    [Fact]
    public async Task Health_returns_ok()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClient();

        var resp = await client.GetAsync("/health");

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
```

- [ ] **Step 2: Run test**

```bash
dotnet test backend/tests/List4Me.Tests.Integration
```

Expected: PASS. (First run pulls Postgres image — slow.)

- [ ] **Step 3: Commit**

```bash
git add backend/
git commit -m "test(backend): add Health integration test (proves Testcontainers pipeline)"
```

---

## Phase D — Household feature (backend, test-first)

### Task D1: Household DTOs + validation filter

**Files:**
- Create: `backend/src/List4Me.Api/Features/Households/HouseholdDtos.cs`
- Create: `backend/src/List4Me.Api/Common/ValidationFilter.cs`

- [ ] **Step 1: Create `HouseholdDtos.cs`**

```csharp
namespace List4Me.Api.Features.Households;

public record CreateHouseholdRequest(string Name);
public record UpdateHouseholdRequest(string Name);
public record CreateInviteRequest(string? Email);

public record HouseholdMemberDto(Guid Id, string DisplayName, string Role, DateTimeOffset JoinedAt);
public record HouseholdDto(Guid Id, string Name, DateTimeOffset CreatedAt, IReadOnlyList<HouseholdMemberDto> Members);
public record InviteDto(Guid Token, string InviteUrl, DateTimeOffset ExpiresAt);
public record InviteInfoDto(Guid Token, string HouseholdName, DateTimeOffset ExpiresAt);
```

- [ ] **Step 2: Create `ValidationFilter.cs`**

```csharp
using FluentValidation;

namespace List4Me.Api.Common;

public class ValidationFilter<T>(IValidator<T> validator) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
    {
        var arg = ctx.Arguments.OfType<T>().FirstOrDefault();
        if (arg is null) return Results.Problem("Missing body", statusCode: 400);
        var result = await validator.ValidateAsync(arg);
        if (!result.IsValid)
        {
            var errors = result.Errors.GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Results.ValidationProblem(errors);
        }
        return await next(ctx);
    }
}
```

- [ ] **Step 3: Register FluentValidation in `Program.cs`**

Add before `builder.Build()`:

```csharp
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
```

Add using: `using FluentValidation;`

- [ ] **Step 4: Verify build**

```bash
dotnet build backend/List4Me.sln
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): add Household DTOs and validation filter"
```

---

### Task D2: POST /api/households — create household (test-first)

**Files:**
- Create: `backend/tests/List4Me.Tests.Integration/HouseholdEndpointTests.cs`
- Create: `backend/src/List4Me.Api/Features/Households/CreateHousehold.cs`
- Create: `backend/src/List4Me.Api/Features/Households/HouseholdEndpoints.cs`
- Modify: `backend/src/List4Me.Api/Program.cs`

- [ ] **Step 1: Write failing test**

```csharp
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Households;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class HouseholdEndpointTests(PostgresFixture pg)
{
    [Fact]
    public async Task Create_household_returns_201_and_makes_user_owner()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClientAs("auth0|alice", "alice@example.com", "Alice");

        var resp = await client.PostAsJsonAsync("/api/households",
            new CreateHouseholdRequest("Alice's Home"));

        resp.StatusCode.Should().Be(HttpStatusCode.Created);
        var dto = await resp.Content.ReadFromJsonAsync<HouseholdDto>();
        dto!.Name.Should().Be("Alice's Home");
        dto.Members.Should().ContainSingle();
        dto.Members[0].Role.Should().Be("Owner");
        dto.Members[0].DisplayName.Should().Be("Alice");
    }

    [Fact]
    public async Task Create_household_when_user_already_has_one_returns_409()
    {
        await using var factory = new ApiFactory(pg);
        var client = factory.CreateClientAs("auth0|bob", "bob@example.com", "Bob");
        await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("First"));

        var resp = await client.PostAsJsonAsync("/api/households",
            new CreateHouseholdRequest("Second"));

        resp.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }
}
```

- [ ] **Step 2: Run test to verify fail**

```bash
dotnet test backend/tests/List4Me.Tests.Integration --filter HouseholdEndpointTests
```

Expected: FAIL (endpoint doesn't exist → 404).

- [ ] **Step 3: Create `CreateHousehold.cs`**

```csharp
using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public class CreateHouseholdValidator : AbstractValidator<CreateHouseholdRequest>
{
    public CreateHouseholdValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
    }
}

public static class CreateHousehold
{
    public static async Task<IResult> Handle(
        CreateHouseholdRequest req,
        AppDbContext db,
        HouseholdContext hc)
    {
        if (hc.User is null) return Results.Unauthorized();
        if (hc.Member is not null) return Results.Conflict(new { message = "User already in a household" });

        var now = DateTimeOffset.UtcNow;
        var household = new Household { Id = Guid.NewGuid(), Name = req.Name, CreatedAt = now };
        var member = new HouseholdMember
        {
            Id = Guid.NewGuid(),
            Household = household,
            HouseholdId = household.Id,
            Auth0UserId = hc.User.Auth0UserId,
            Role = HouseholdRole.Owner,
            DisplayName = hc.User.DisplayName ?? "User",
            JoinedAt = now
        };

        db.Households.Add(household);
        db.HouseholdMembers.Add(member);
        await db.SaveChangesAsync();

        var dto = new HouseholdDto(household.Id, household.Name, household.CreatedAt,
            new[] { new HouseholdMemberDto(member.Id, member.DisplayName, member.Role.ToString(), member.JoinedAt) });
        return Results.Created($"/api/households/{household.Id}", dto);
    }
}
```

- [ ] **Step 4: Create `HouseholdEndpoints.cs`**

```csharp
using List4Me.Api.Common;

namespace List4Me.Api.Features.Households;

public static class HouseholdEndpoints
{
    public static IEndpointRouteBuilder MapHouseholds(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/households").RequireAuthorization();

        group.MapPost("/", CreateHousehold.Handle)
             .AddEndpointFilter<ValidationFilter<CreateHouseholdRequest>>();

        return app;
    }
}
```

- [ ] **Step 5: Wire in `Program.cs`**

```csharp
using List4Me.Api.Features.Households;
```

After `app.MapHealth();`:

```csharp
app.MapHouseholds();
```

- [ ] **Step 6: Run tests**

```bash
dotnet test backend/tests/List4Me.Tests.Integration --filter HouseholdEndpointTests
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat(backend): POST /api/households creates household + owner member"
```

---

### Task D3: GET /api/households/me + UpdateHousehold (test-first)

**Files:**
- Modify: `backend/tests/List4Me.Tests.Integration/HouseholdEndpointTests.cs`
- Create: `backend/src/List4Me.Api/Features/Households/GetMyHousehold.cs`
- Create: `backend/src/List4Me.Api/Features/Households/UpdateHousehold.cs`
- Modify: `backend/src/List4Me.Api/Features/Households/HouseholdEndpoints.cs`

- [ ] **Step 1: Add failing tests**

Append to `HouseholdEndpointTests`:

```csharp
[Fact]
public async Task GetMe_without_household_returns_404()
{
    await using var factory = new ApiFactory(pg);
    var client = factory.CreateClientAs("auth0|charlie");
    var resp = await client.GetAsync("/api/households/me");
    resp.StatusCode.Should().Be(HttpStatusCode.NotFound);
}

[Fact]
public async Task GetMe_returns_household_with_members()
{
    await using var factory = new ApiFactory(pg);
    var client = factory.CreateClientAs("auth0|dana", name: "Dana");
    await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("Dana Home"));

    var resp = await client.GetAsync("/api/households/me");

    resp.StatusCode.Should().Be(HttpStatusCode.OK);
    var dto = await resp.Content.ReadFromJsonAsync<HouseholdDto>();
    dto!.Name.Should().Be("Dana Home");
    dto.Members.Should().ContainSingle(m => m.DisplayName == "Dana");
}

[Fact]
public async Task Update_household_name_by_owner_succeeds()
{
    await using var factory = new ApiFactory(pg);
    var client = factory.CreateClientAs("auth0|eve", name: "Eve");
    await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("Old"));

    var resp = await client.PatchAsJsonAsync("/api/households/me",
        new UpdateHouseholdRequest("New"));

    resp.StatusCode.Should().Be(HttpStatusCode.OK);
    var get = await client.GetFromJsonAsync<HouseholdDto>("/api/households/me");
    get!.Name.Should().Be("New");
}
```

- [ ] **Step 2: Run tests** — expect FAIL.

- [ ] **Step 3: Create `GetMyHousehold.cs`**

```csharp
using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public static class GetMyHousehold
{
    public static async Task<IResult> Handle(AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();

        var household = await db.Households
            .Include(h => h.Members)
            .FirstAsync(h => h.Id == hc.Member.HouseholdId);

        var dto = new HouseholdDto(
            household.Id, household.Name, household.CreatedAt,
            household.Members
                .OrderBy(m => m.JoinedAt)
                .Select(m => new HouseholdMemberDto(m.Id, m.DisplayName, m.Role.ToString(), m.JoinedAt))
                .ToList());
        return Results.Ok(dto);
    }
}
```

- [ ] **Step 4: Create `UpdateHousehold.cs`**

```csharp
using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public class UpdateHouseholdValidator : AbstractValidator<UpdateHouseholdRequest>
{
    public UpdateHouseholdValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
    }
}

public static class UpdateHousehold
{
    public static async Task<IResult> Handle(UpdateHouseholdRequest req, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        if (hc.Member.Role != HouseholdRole.Owner) return Results.Forbid();

        var household = await db.Households.FirstAsync(h => h.Id == hc.Member.HouseholdId);
        household.Name = req.Name;
        await db.SaveChangesAsync();
        return Results.Ok();
    }
}
```

- [ ] **Step 5: Wire endpoints**

Update `HouseholdEndpoints.cs`:

```csharp
group.MapGet("/me", GetMyHousehold.Handle);
group.MapPatch("/me", UpdateHousehold.Handle)
     .AddEndpointFilter<ValidationFilter<UpdateHouseholdRequest>>();
```

- [ ] **Step 6: Run tests** — expect PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat(backend): GET/PATCH /api/households/me"
```

---

### Task D4: Invite create/accept/get (test-first)

**Files:**
- Modify: `backend/tests/List4Me.Tests.Integration/HouseholdEndpointTests.cs`
- Create: `backend/src/List4Me.Api/Features/Households/CreateInvite.cs`
- Create: `backend/src/List4Me.Api/Features/Households/GetInvite.cs`
- Create: `backend/src/List4Me.Api/Features/Households/AcceptInvite.cs`
- Modify: `backend/src/List4Me.Api/Features/Households/HouseholdEndpoints.cs`
- Modify: `backend/src/List4Me.Api/Program.cs`

- [ ] **Step 1: Add failing tests**

```csharp
[Fact]
public async Task Owner_can_create_invite_and_second_user_can_accept()
{
    await using var factory = new ApiFactory(pg);
    var owner = factory.CreateClientAs("auth0|owner", name: "Owner");
    await owner.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("Home"));

    var inviteResp = await owner.PostAsJsonAsync("/api/households/me/invites",
        new CreateInviteRequest(Email: null));
    inviteResp.StatusCode.Should().Be(HttpStatusCode.Created);
    var invite = await inviteResp.Content.ReadFromJsonAsync<InviteDto>();

    var newbie = factory.CreateClientAs("auth0|newbie", name: "Newbie");
    var infoResp = await newbie.GetAsync($"/api/invites/{invite!.Token}");
    infoResp.StatusCode.Should().Be(HttpStatusCode.OK);
    var info = await infoResp.Content.ReadFromJsonAsync<InviteInfoDto>();
    info!.HouseholdName.Should().Be("Home");

    var accept = await newbie.PostAsync($"/api/invites/{invite.Token}/accept", null);
    accept.StatusCode.Should().Be(HttpStatusCode.OK);

    var me = await newbie.GetFromJsonAsync<HouseholdDto>("/api/households/me");
    me!.Members.Should().HaveCount(2);
}

[Fact]
public async Task Non_owner_cannot_create_invite()
{
    await using var factory = new ApiFactory(pg);
    var owner = factory.CreateClientAs("auth0|o2", name: "O");
    await owner.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("H"));
    var invite = await (await owner.PostAsJsonAsync("/api/households/me/invites",
        new CreateInviteRequest(null))).Content.ReadFromJsonAsync<InviteDto>();
    var member = factory.CreateClientAs("auth0|m2", name: "M");
    await member.PostAsync($"/api/invites/{invite!.Token}/accept", null);

    var resp = await member.PostAsJsonAsync("/api/households/me/invites",
        new CreateInviteRequest(null));
    resp.StatusCode.Should().Be(HttpStatusCode.Forbidden);
}
```

- [ ] **Step 2: Run tests** — FAIL.

- [ ] **Step 3: Create `CreateInvite.cs`**

```csharp
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;

namespace List4Me.Api.Features.Households;

public static class CreateInvite
{
    public static async Task<IResult> Handle(
        CreateInviteRequest req, AppDbContext db, HouseholdContext hc, IConfiguration cfg)
    {
        if (hc.Member is null) return Results.NotFound();
        if (hc.Member.Role != HouseholdRole.Owner) return Results.Forbid();

        var invite = new HouseholdInvite
        {
            Id = Guid.NewGuid(),
            HouseholdId = hc.Member.HouseholdId,
            Email = req.Email,
            Token = Guid.NewGuid(),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7),
            CreatedByMemberId = hc.Member.Id,
            CreatedAt = DateTimeOffset.UtcNow
        };
        db.HouseholdInvites.Add(invite);
        await db.SaveChangesAsync();

        var baseUrl = cfg["FrontendUrl"] ?? "http://localhost:5173";
        var url = $"{baseUrl}/invite/{invite.Token}";
        return Results.Created(url, new InviteDto(invite.Token, url, invite.ExpiresAt));
    }
}
```

- [ ] **Step 4: Create `GetInvite.cs`**

```csharp
using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public static class GetInvite
{
    public static async Task<IResult> Handle(Guid token, AppDbContext db, HouseholdContext hc)
    {
        if (hc.User is null) return Results.Unauthorized();
        var invite = await db.HouseholdInvites
            .Include(i => i.Household)
            .FirstOrDefaultAsync(i => i.Token == token);
        if (invite is null || invite.UsedAt is not null || invite.ExpiresAt < DateTimeOffset.UtcNow)
            return Results.NotFound();
        return Results.Ok(new InviteInfoDto(invite.Token, invite.Household.Name, invite.ExpiresAt));
    }
}
```

- [ ] **Step 5: Create `AcceptInvite.cs`**

```csharp
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Households;

public static class AcceptInvite
{
    public static async Task<IResult> Handle(Guid token, AppDbContext db, HouseholdContext hc)
    {
        if (hc.User is null) return Results.Unauthorized();
        if (hc.Member is not null) return Results.Conflict(new { message = "Already in a household" });

        var invite = await db.HouseholdInvites.FirstOrDefaultAsync(i => i.Token == token);
        if (invite is null || invite.UsedAt is not null || invite.ExpiresAt < DateTimeOffset.UtcNow)
            return Results.NotFound();

        var member = new HouseholdMember
        {
            Id = Guid.NewGuid(),
            HouseholdId = invite.HouseholdId,
            Auth0UserId = hc.User.Auth0UserId,
            Role = HouseholdRole.Member,
            DisplayName = hc.User.DisplayName ?? "User",
            JoinedAt = DateTimeOffset.UtcNow
        };
        invite.UsedAt = DateTimeOffset.UtcNow;
        db.HouseholdMembers.Add(member);
        await db.SaveChangesAsync();
        return Results.Ok();
    }
}
```

- [ ] **Step 6: Wire endpoints**

Update `HouseholdEndpoints.cs`:

```csharp
group.MapPost("/me/invites", CreateInvite.Handle)
     .AddEndpointFilter<ValidationFilter<CreateInviteRequest>>();

// invite lookup lives outside /api/households:
public static IEndpointRouteBuilder MapInvites(this IEndpointRouteBuilder app)
{
    var g = app.MapGroup("/api/invites").RequireAuthorization();
    g.MapGet("/{token:guid}", GetInvite.Handle);
    g.MapPost("/{token:guid}/accept", AcceptInvite.Handle);
    return app;
}
```

Add validator (empty rules, accept any email):

```csharp
public class CreateInviteValidator : AbstractValidator<CreateInviteRequest>
{
    public CreateInviteValidator()
    {
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
    }
}
```

Add to `Program.cs`:

```csharp
app.MapInvites();
```

- [ ] **Step 7: Run tests** — PASS.

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat(backend): household invites (create, get info, accept)"
```

---

### Task D5: Cross-household isolation tests

**Files:**
- Create: `backend/tests/List4Me.Tests.Integration/HouseholdIsolationTests.cs`

- [ ] **Step 1: Write test**

```csharp
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Households;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class HouseholdIsolationTests(PostgresFixture pg)
{
    [Fact]
    public async Task UserA_and_UserB_have_isolated_households()
    {
        await using var factory = new ApiFactory(pg);
        var alice = factory.CreateClientAs("auth0|iso-alice", name: "Alice");
        var bob = factory.CreateClientAs("auth0|iso-bob", name: "Bob");

        await alice.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("A-House"));
        await bob.PostAsJsonAsync("/api/households", new CreateHouseholdRequest("B-House"));

        var aHouse = await alice.GetFromJsonAsync<HouseholdDto>("/api/households/me");
        var bHouse = await bob.GetFromJsonAsync<HouseholdDto>("/api/households/me");

        aHouse!.Name.Should().Be("A-House");
        bHouse!.Name.Should().Be("B-House");
        aHouse.Id.Should().NotBe(bHouse.Id);
    }

    [Fact]
    public async Task Unauthenticated_request_returns_401()
    {
        await using var factory = new ApiFactory(pg);
        var anonymous = factory.CreateClient();
        var resp = await anonymous.GetAsync("/api/households/me");
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
```

- [ ] **Step 2: Run tests** — PASS.

- [ ] **Step 3: Commit**

```bash
git add backend/
git commit -m "test(backend): cross-household isolation + auth-required tests"
```

---

## Phase E — Categories feature (backend)

### Task E1: Category DTOs + curated icon key set

**Files:**
- Create: `backend/src/List4Me.Api/Features/Categories/CategoryDtos.cs`
- Create: `backend/src/List4Me.Api/Features/Categories/IconKeys.cs`

- [ ] **Step 1: Create `IconKeys.cs`** (allowed Lucide icons)

```csharp
namespace List4Me.Api.Features.Categories;

public static class IconKeys
{
    public static readonly IReadOnlySet<string> Allowed = new HashSet<string>(StringComparer.Ordinal)
    {
        "shopping-cart", "shopping-bag", "utensils", "apple", "carrot", "beef", "fish",
        "milk", "coffee", "wine", "beer", "cookie", "cake", "pizza", "sandwich",
        "refrigerator", "snowflake", "thermometer", "flame",
        "palm-tree", "sun", "umbrella", "tent", "backpack", "camera", "car", "plane", "luggage",
        "briefcase", "gift", "heart", "star",
        "pill", "syringe", "baby", "dog", "cat",
        "hammer", "wrench", "screwdriver", "paintbrush",
        "book", "pencil", "flower", "leaf", "trees",
        "washing-machine", "shirt", "shoe",
        "bath", "shower-head",
        "list", "clipboard", "clipboard-list", "check-square",
        "home", "bed", "sofa", "lamp",
        "package", "box", "layers"
    };
}
```

- [ ] **Step 2: Create `CategoryDtos.cs`**

```csharp
namespace List4Me.Api.Features.Categories;

public record CategoryDto(
    Guid Id,
    string Name,
    string IconKey,
    Guid? ParentCategoryId,
    string CompletedLabel,
    int SortOrder,
    IReadOnlyList<CategoryDto> Subcategories);

public record CreateCategoryRequest(
    string Name,
    string IconKey,
    Guid? ParentCategoryId,
    string? CompletedLabel);

public record UpdateCategoryRequest(
    string Name,
    string IconKey,
    string CompletedLabel,
    int? SortOrder);
```

- [ ] **Step 3: Verify build**

```bash
dotnet build backend/List4Me.sln
```

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat(backend): add Category DTOs and curated Lucide icon key set"
```

---

### Task E2: GET /api/categories (test-first)

**Files:**
- Create: `backend/tests/List4Me.Tests.Integration/CategoryEndpointTests.cs`
- Create: `backend/src/List4Me.Api/Features/Categories/ListCategories.cs`
- Create: `backend/src/List4Me.Api/Features/Categories/CategoryEndpoints.cs`
- Modify: `backend/src/List4Me.Api/Program.cs`

- [ ] **Step 1: Write failing test**

```csharp
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using List4Me.Api.Features.Categories;
using List4Me.Api.Features.Households;
using List4Me.Tests.Integration.Fixtures;
using Xunit;

namespace List4Me.Tests.Integration;

[Collection("Postgres")]
public class CategoryEndpointTests(PostgresFixture pg)
{
    private static async Task<HttpClient> HouseholdClient(ApiFactory factory, string userId, string name)
    {
        var client = factory.CreateClientAs(userId, name: name);
        await client.PostAsJsonAsync("/api/households", new CreateHouseholdRequest($"{name}-House"));
        return client;
    }

    [Fact]
    public async Task List_returns_empty_when_no_categories()
    {
        await using var factory = new ApiFactory(pg);
        var client = await HouseholdClient(factory, "auth0|cat-a", "A");

        var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");

        items.Should().BeEmpty();
    }
}
```

- [ ] **Step 2: Run test** — FAIL (404).

- [ ] **Step 3: Create `ListCategories.cs`**

```csharp
using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Categories;

public static class ListCategories
{
    public static async Task<IResult> Handle(AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();

        var householdId = hc.Member.HouseholdId;
        var rows = await db.Categories
            .Where(c => c.HouseholdId == householdId && c.DeletedAt == null)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync();

        var byParent = rows.ToLookup(c => c.ParentCategoryId);

        List<CategoryDto> Build(Guid? parent) =>
            byParent[parent].Select(c => new CategoryDto(
                c.Id, c.Name, c.IconKey, c.ParentCategoryId, c.CompletedLabel, c.SortOrder,
                Build(c.Id))).ToList();

        return Results.Ok(Build(null));
    }
}
```

- [ ] **Step 4: Create `CategoryEndpoints.cs`**

```csharp
using List4Me.Api.Common;

namespace List4Me.Api.Features.Categories;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategories(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/categories").RequireAuthorization();
        g.MapGet("/", ListCategories.Handle);
        return app;
    }
}
```

Add `app.MapCategories();` in `Program.cs` (and `using List4Me.Api.Features.Categories;`).

- [ ] **Step 5: Run test** — PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat(backend): GET /api/categories (empty happy path)"
```

---

### Task E3: POST /api/categories (test-first, incl. subcategory + icon validation)

**Files:**
- Modify: `backend/tests/List4Me.Tests.Integration/CategoryEndpointTests.cs`
- Create: `backend/src/List4Me.Api/Features/Categories/CreateCategory.cs`
- Modify: `backend/src/List4Me.Api/Features/Categories/CategoryEndpoints.cs`

- [ ] **Step 1: Add failing tests**

```csharp
[Fact]
public async Task Create_top_level_category_returns_201_and_appears_in_list()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|cat-b", "B");

    var resp = await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("Bevásárlás", "shopping-cart", null, "Megvettem"));
    resp.StatusCode.Should().Be(HttpStatusCode.Created);

    var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
    items.Should().ContainSingle(c => c.Name == "Bevásárlás");
    items![0].CompletedLabel.Should().Be("Megvettem");
}

[Fact]
public async Task Create_subcategory_nests_under_parent()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|cat-c", "C");

    var parentResp = await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("Bevásárlás", "shopping-cart", null, null));
    var parent = await parentResp.Content.ReadFromJsonAsync<CategoryDto>();

    var childResp = await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("Pékáru", "cookie", parent!.Id, null));
    childResp.StatusCode.Should().Be(HttpStatusCode.Created);

    var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
    items!.Should().ContainSingle();
    items[0].Subcategories.Should().ContainSingle(s => s.Name == "Pékáru");
}

[Fact]
public async Task Create_second_level_subcategory_rejected()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|cat-d", "D");
    var parent = await (await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("P", "shopping-cart", null, null))).Content.ReadFromJsonAsync<CategoryDto>();
    var child = await (await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("C", "cookie", parent!.Id, null))).Content.ReadFromJsonAsync<CategoryDto>();

    var resp = await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("GC", "apple", child!.Id, null));

    resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
}

[Fact]
public async Task Create_with_invalid_icon_returns_400()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|cat-e", "E");

    var resp = await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("X", "not-a-real-icon", null, null));

    resp.StatusCode.Should().Be(HttpStatusCode.BadRequest);
}
```

- [ ] **Step 2: Run tests** — FAIL.

- [ ] **Step 3: Create `CreateCategory.cs`**

```csharp
using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using List4Me.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Categories;

public class CreateCategoryValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
        RuleFor(x => x.IconKey).NotEmpty()
            .Must(k => IconKeys.Allowed.Contains(k))
            .WithMessage("Ismeretlen ikon");
        RuleFor(x => x.CompletedLabel!).MaximumLength(40)
            .When(x => !string.IsNullOrEmpty(x.CompletedLabel));
    }
}

public static class CreateCategory
{
    public static async Task<IResult> Handle(CreateCategoryRequest req, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;

        if (req.ParentCategoryId is Guid parentId)
        {
            var parent = await db.Categories.FirstOrDefaultAsync(
                c => c.Id == parentId && c.HouseholdId == householdId && c.DeletedAt == null);
            if (parent is null)
                return Results.ValidationProblem(new Dictionary<string, string[]>
                { ["parentCategoryId"] = ["Nincs ilyen kategória"] });
            if (parent.ParentCategoryId is not null)
                return Results.ValidationProblem(new Dictionary<string, string[]>
                { ["parentCategoryId"] = ["Alkategória alá nem hozható létre alkategória (max 1 szint)"] });
        }

        var now = DateTimeOffset.UtcNow;
        var maxSort = await db.Categories
            .Where(c => c.HouseholdId == householdId && c.ParentCategoryId == req.ParentCategoryId)
            .Select(c => (int?)c.SortOrder).MaxAsync() ?? -1;

        var cat = new Category
        {
            Id = Guid.NewGuid(),
            HouseholdId = householdId,
            Name = req.Name,
            IconKey = req.IconKey,
            ParentCategoryId = req.ParentCategoryId,
            CompletedLabel = string.IsNullOrWhiteSpace(req.CompletedLabel) ? "Kész" : req.CompletedLabel,
            SortOrder = maxSort + 1,
            CreatedAt = now,
            UpdatedAt = now
        };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();

        var dto = new CategoryDto(cat.Id, cat.Name, cat.IconKey, cat.ParentCategoryId,
            cat.CompletedLabel, cat.SortOrder, Array.Empty<CategoryDto>());
        return Results.Created($"/api/categories/{cat.Id}", dto);
    }
}
```

- [ ] **Step 4: Wire endpoint**

Update `CategoryEndpoints.cs`:

```csharp
g.MapPost("/", CreateCategory.Handle)
 .AddEndpointFilter<ValidationFilter<CreateCategoryRequest>>();
```

- [ ] **Step 5: Run tests** — PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat(backend): POST /api/categories with icon + 1-level subcategory validation"
```

---

### Task E4: PATCH + DELETE categories (test-first)

**Files:**
- Modify: `backend/tests/List4Me.Tests.Integration/CategoryEndpointTests.cs`
- Create: `backend/src/List4Me.Api/Features/Categories/UpdateCategory.cs`
- Create: `backend/src/List4Me.Api/Features/Categories/DeleteCategory.cs`
- Modify: `backend/src/List4Me.Api/Features/Categories/CategoryEndpoints.cs`

- [ ] **Step 1: Add failing tests**

```csharp
[Fact]
public async Task Update_category_changes_name_and_icon_and_label()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|cat-u", "U");
    var created = await (await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("Old", "shopping-cart", null, "K"))).Content.ReadFromJsonAsync<CategoryDto>();

    var resp = await client.PatchAsJsonAsync($"/api/categories/{created!.Id}",
        new UpdateCategoryRequest("New", "apple", "Megvettem", 5));
    resp.StatusCode.Should().Be(HttpStatusCode.OK);

    var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
    items.Should().ContainSingle();
    items![0].Name.Should().Be("New");
    items[0].IconKey.Should().Be("apple");
    items[0].CompletedLabel.Should().Be("Megvettem");
}

[Fact]
public async Task Delete_empty_category_soft_deletes()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|cat-del", "D");
    var created = await (await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("X", "shopping-cart", null, null))).Content.ReadFromJsonAsync<CategoryDto>();

    var resp = await client.DeleteAsync($"/api/categories/{created!.Id}");
    resp.StatusCode.Should().Be(HttpStatusCode.NoContent);

    var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
    items.Should().BeEmpty();
}

[Fact]
public async Task Delete_category_with_subcategories_without_force_returns_409()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|cat-df", "F");
    var parent = await (await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("P", "shopping-cart", null, null))).Content.ReadFromJsonAsync<CategoryDto>();
    await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("C", "cookie", parent!.Id, null));

    var resp = await client.DeleteAsync($"/api/categories/{parent.Id}");
    resp.StatusCode.Should().Be(HttpStatusCode.Conflict);
}

[Fact]
public async Task Delete_category_with_force_cascades_subcategories()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|cat-dc", "C");
    var parent = await (await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("P", "shopping-cart", null, null))).Content.ReadFromJsonAsync<CategoryDto>();
    await client.PostAsJsonAsync("/api/categories",
        new CreateCategoryRequest("Sub", "cookie", parent!.Id, null));

    var resp = await client.DeleteAsync($"/api/categories/{parent.Id}?force=true");
    resp.StatusCode.Should().Be(HttpStatusCode.NoContent);

    var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
    items.Should().BeEmpty();
}
```

- [ ] **Step 2: Run tests** — FAIL.

- [ ] **Step 3: Create `UpdateCategory.cs`**

```csharp
using FluentValidation;
using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Categories;

public class UpdateCategoryValidator : AbstractValidator<UpdateCategoryRequest>
{
    public UpdateCategoryValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(80);
        RuleFor(x => x.IconKey).Must(k => IconKeys.Allowed.Contains(k)).WithMessage("Ismeretlen ikon");
        RuleFor(x => x.CompletedLabel).NotEmpty().MaximumLength(40);
    }
}

public static class UpdateCategory
{
    public static async Task<IResult> Handle(Guid id, UpdateCategoryRequest req, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var cat = await db.Categories.FirstOrDefaultAsync(
            c => c.Id == id && c.HouseholdId == hc.Member.HouseholdId && c.DeletedAt == null);
        if (cat is null) return Results.NotFound();

        cat.Name = req.Name;
        cat.IconKey = req.IconKey;
        cat.CompletedLabel = req.CompletedLabel;
        if (req.SortOrder.HasValue) cat.SortOrder = req.SortOrder.Value;
        cat.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return Results.Ok();
    }
}
```

- [ ] **Step 4: Create `DeleteCategory.cs`**

```csharp
using List4Me.Api.Auth;
using List4Me.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace List4Me.Api.Features.Categories;

public static class DeleteCategory
{
    public static async Task<IResult> Handle(Guid id, bool? force, AppDbContext db, HouseholdContext hc)
    {
        if (hc.Member is null) return Results.NotFound();
        var householdId = hc.Member.HouseholdId;
        var cat = await db.Categories
            .Include(c => c.Subcategories.Where(s => s.DeletedAt == null))
            .Include(c => c.Products.Where(p => p.DeletedAt == null))
            .FirstOrDefaultAsync(c => c.Id == id && c.HouseholdId == householdId && c.DeletedAt == null);
        if (cat is null) return Results.NotFound();

        var hasChildren = cat.Subcategories.Count > 0 || cat.Products.Count > 0;
        if (hasChildren && force != true)
        {
            return Results.Conflict(new
            {
                message = "Kategória nem üres",
                subcategories = cat.Subcategories.Count,
                products = cat.Products.Count
            });
        }

        var now = DateTimeOffset.UtcNow;
        cat.DeletedAt = now;
        foreach (var s in cat.Subcategories) s.DeletedAt = now;
        foreach (var p in cat.Products) p.DeletedAt = now;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
```

- [ ] **Step 5: Wire endpoints**

```csharp
g.MapPatch("/{id:guid}", UpdateCategory.Handle)
 .AddEndpointFilter<ValidationFilter<UpdateCategoryRequest>>();
g.MapDelete("/{id:guid}", DeleteCategory.Handle);
```

- [ ] **Step 6: Run tests** — PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat(backend): PATCH + DELETE categories (soft delete, force=cascade)"
```

---

### Task E5: Default seed data (categories + products)

**Files:**
- Create: `backend/src/List4Me.Api/Data/Seed/DefaultSeed.cs`
- Modify: `backend/src/List4Me.Api/Features/Households/CreateHousehold.cs`

- [ ] **Step 1: Create `DefaultSeed.cs`**

```csharp
using List4Me.Api.Domain;

namespace List4Me.Api.Data.Seed;

public static class DefaultSeed
{
    public record SeedProduct(string Name, decimal? DefaultQty, string? DefaultUnit);
    public record SeedSubcategory(string Name, string IconKey, SeedProduct[] Products);
    public record SeedCategory(string Name, string IconKey, string CompletedLabel,
                               SeedSubcategory[] Subcategories, SeedProduct[] TopLevelProducts);

    public static readonly SeedCategory[] Categories =
    [
        new("Bevásárlás", "shopping-cart", "Megvettem", new[]
        {
            new SeedSubcategory("Tejtermékek", "milk", new SeedProduct[]
            {
                new("Tej", 1, "l"), new("Vaj", 250, "g"), new("Joghurt", 1, "db"),
                new("Sajt", 200, "g"), new("Tejföl", 1, "db")
            }),
            new SeedSubcategory("Pékáru", "cookie", new SeedProduct[]
            {
                new("Kenyér", 1, "db"), new("Kifli", 4, "db"), new("Zsemle", 4, "db")
            }),
            new SeedSubcategory("Zöldség-gyümölcs", "apple", new SeedProduct[]
            {
                new("Alma", 1, "kg"), new("Banán", 1, "kg"), new("Paradicsom", 1, "kg"),
                new("Uborka", 500, "g"), new("Krumpli", 2, "kg"), new("Hagyma", 1, "kg")
            }),
            new SeedSubcategory("Húsáru", "beef", new SeedProduct[]
            {
                new("Csirkemell", 500, "g"), new("Sertés karaj", 500, "g")
            })
        }, Array.Empty<SeedProduct>()),

        new("Hűtő", "refrigerator", "Elfogyott", Array.Empty<SeedSubcategory>(), new SeedProduct[]
        {
            new("Tej", 1, "l"), new("Vaj", null, null), new("Joghurt", null, null),
            new("Sajt", null, null), new("Sonka", null, null)
        }),

        new("Fagyasztó", "snowflake", "Elfogyott", Array.Empty<SeedSubcategory>(), new SeedProduct[]
        {
            new("Fagyasztott zöldség", null, null), new("Fagyasztott gyümölcs", null, null),
            new("Fagyi", null, null), new("Pizza", null, null)
        }),

        new("Nyaralás", "palm-tree", "Bepakolva", new[]
        {
            new SeedSubcategory("Ruházat", "shirt", new SeedProduct[]
            {
                new("Póló", 5, "db"), new("Rövidnadrág", 3, "db"), new("Fürdőruha", 2, "db")
            }),
            new SeedSubcategory("Higiénia", "shower-head", new SeedProduct[]
            {
                new("Fogkefe", 1, "db"), new("Fogkrém", 1, "db"), new("Naptej", 1, "db")
            }),
            new SeedSubcategory("Dokumentumok", "briefcase", new SeedProduct[]
            {
                new("Útlevél", null, null), new("Jogosítvány", null, null),
                new("Biztosítás", null, null)
            })
        }, Array.Empty<SeedProduct>())
    ];

    public static void Apply(AppDbContext db, Guid householdId)
    {
        var now = DateTimeOffset.UtcNow;
        int sort = 0;
        foreach (var seed in Categories)
        {
            var cat = new Category
            {
                Id = Guid.NewGuid(),
                HouseholdId = householdId,
                Name = seed.Name,
                IconKey = seed.IconKey,
                CompletedLabel = seed.CompletedLabel,
                SortOrder = sort++,
                CreatedAt = now,
                UpdatedAt = now
            };
            db.Categories.Add(cat);

            int subSort = 0;
            foreach (var sub in seed.Subcategories)
            {
                var subCat = new Category
                {
                    Id = Guid.NewGuid(),
                    HouseholdId = householdId,
                    Name = sub.Name,
                    IconKey = sub.IconKey,
                    ParentCategoryId = cat.Id,
                    CompletedLabel = seed.CompletedLabel,
                    SortOrder = subSort++,
                    CreatedAt = now, UpdatedAt = now
                };
                db.Categories.Add(subCat);
                foreach (var p in sub.Products)
                {
                    db.Products.Add(new Product
                    {
                        Id = Guid.NewGuid(), CategoryId = subCat.Id,
                        Name = p.Name, DefaultQuantity = p.DefaultQty, DefaultUnit = p.DefaultUnit,
                        CreatedAt = now, UpdatedAt = now
                    });
                }
            }
            foreach (var p in seed.TopLevelProducts)
            {
                db.Products.Add(new Product
                {
                    Id = Guid.NewGuid(), CategoryId = cat.Id,
                    Name = p.Name, DefaultQuantity = p.DefaultQty, DefaultUnit = p.DefaultUnit,
                    CreatedAt = now, UpdatedAt = now
                });
            }
        }
    }
}
```

- [ ] **Step 2: Apply seed in `CreateHousehold`**

Modify `CreateHousehold.Handle` — before `await db.SaveChangesAsync();`:

```csharp
DefaultSeed.Apply(db, household.Id);
```

Add using: `using List4Me.Api.Data.Seed;`

- [ ] **Step 3: Add integration test verifying seed**

Append to `CategoryEndpointTests`:

```csharp
[Fact]
public async Task New_household_has_4_default_top_level_categories()
{
    await using var factory = new ApiFactory(pg);
    var client = await HouseholdClient(factory, "auth0|seed-a", "Seed");

    var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
    items!.Select(c => c.Name).Should().BeEquivalentTo(
        new[] { "Bevásárlás", "Hűtő", "Fagyasztó", "Nyaralás" });
    items.First(c => c.Name == "Bevásárlás").Subcategories.Should().NotBeEmpty();
    items.First(c => c.Name == "Bevásárlás").CompletedLabel.Should().Be("Megvettem");
    items.First(c => c.Name == "Hűtő").CompletedLabel.Should().Be("Elfogyott");
}
```

Note: previous tests in this file assumed empty categories after household creation. Update them by deleting all categories before assertions **or** rewrite each test to expect the seeded state. Simplest: at the top of every test that needs an empty state, call:

```csharp
private static async Task ClearCategories(HttpClient client)
{
    var items = await client.GetFromJsonAsync<CategoryDto[]>("/api/categories");
    foreach (var c in items!)
        await client.DeleteAsync($"/api/categories/{c.Id}?force=true");
}
```

Insert `await ClearCategories(client);` right after `HouseholdClient(...)` in each existing category test (except the new seed test).

- [ ] **Step 4: Run all tests** — PASS.

```bash
dotnet test backend/tests/List4Me.Tests.Integration
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): seed 4 default categories + ~50 products on household creation"
```

---

## Phase F — Frontend foundation

### Task F1: Vite + React + TS + Tailwind scaffold

**Files:**
- Create: `frontend/*` (Vite scaffolded)

- [ ] **Step 1: Scaffold with Vite**

From repo root:

```bash
pnpm create vite frontend --template react-ts
cd frontend
pnpm install
```

- [ ] **Step 2: Install Tailwind + PostCSS**

```bash
pnpm add -D tailwindcss@^4 @tailwindcss/postcss postcss autoprefixer
```

- [ ] **Step 3: Configure Tailwind v4**

Create `frontend/postcss.config.js`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {}
  }
}
```

Create `frontend/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#2563eb" },
        success: "#16a34a",
        danger: "#dc2626"
      }
    }
  }
} satisfies Config
```

Replace `frontend/src/index.css` with `frontend/src/styles/globals.css`:

```bash
mkdir -p frontend/src/styles
rm frontend/src/index.css frontend/src/App.css
```

Create `frontend/src/styles/globals.css`:

```css
@import "tailwindcss";

@layer base {
  :root { font-family: system-ui, -apple-system, "Inter", sans-serif; }
  html, body, #root { height: 100%; }
  body { @apply bg-neutral-50 text-neutral-900 antialiased; }
  @media (prefers-color-scheme: dark) {
    body { @apply bg-neutral-950 text-neutral-100; }
  }
}
```

- [ ] **Step 4: Simplify `main.tsx` and `App.tsx`**

`frontend/src/main.tsx`:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./styles/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

`frontend/src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">List4Me</h1>
    </div>
  )
}
```

- [ ] **Step 5: Run dev server**

```bash
pnpm dev
```

Open `http://localhost:5173`. Expected: "List4Me" heading centered. Stop server.

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "chore(frontend): scaffold Vite + React + TS + Tailwind v4"
```

---

### Task F2: Install core deps + shadcn-style component base

**Files:**
- Create: `frontend/src/lib/cn.ts`
- Create: `frontend/src/components/ui/button.tsx`
- Create: `frontend/src/components/ui/input.tsx`
- Create: `frontend/src/components/ui/dialog.tsx`

- [ ] **Step 1: Install deps**

```bash
cd frontend
pnpm add react-router@^7 @tanstack/react-query@^5 @auth0/auth0-react@^2 \
        @microsoft/signalr@^8 lucide-react framer-motion clsx tailwind-merge \
        @radix-ui/react-dialog @radix-ui/react-toast
pnpm add -D @types/node vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Create `cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Create `Button`**

`frontend/src/components/ui/button.tsx`:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
  ghost: "bg-transparent hover:bg-neutral-100",
  danger: "bg-danger text-white hover:bg-red-700"
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
        "min-h-11 min-w-11 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...rest}
    />
  )
)
Button.displayName = "Button"
```

- [ ] **Step 4: Create `Input`**

`frontend/src/components/ui/input.tsx`:

```tsx
import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm",
        "min-h-11 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand",
        className
      )}
      {...rest}
    />
  )
)
Input.displayName = "Input"
```

- [ ] **Step 5: Create `Dialog` (Radix wrapper)**

`frontend/src/components/ui/dialog.tsx`:

```tsx
import * as D from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/cn"

export const Dialog = D.Root
export const DialogTrigger = D.Trigger

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 bg-black/50 z-40" />
      <D.Content className={cn(
        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
        "w-[90vw] max-w-md rounded-2xl bg-white p-6 shadow-xl",
        "dark:bg-neutral-900",
        className
      )}>
        <D.Close className="absolute right-3 top-3 rounded-full p-1 hover:bg-neutral-100">
          <X className="size-5" />
        </D.Close>
        {children}
      </D.Content>
    </D.Portal>
  )
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <D.Title className="text-lg font-semibold mb-2">{children}</D.Title>
}
```

- [ ] **Step 6: Configure `@/` path alias**

Update `frontend/tsconfig.json` compilerOptions:

```json
"baseUrl": ".",
"paths": { "@/*": ["src/*"] }
```

Update `frontend/vite.config.ts`:

```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { port: 5173 }
})
```

- [ ] **Step 7: Verify build**

```bash
pnpm build
```

Expected: success.

- [ ] **Step 8: Commit**

```bash
git add frontend/
git commit -m "chore(frontend): install deps + UI primitives (Button/Input/Dialog)"
```

---

### Task F3: API client with JWT injection + TanStack Query

**Files:**
- Create: `frontend/src/lib/queryClient.ts`
- Create: `frontend/src/lib/api.ts`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create `queryClient.ts`**

```ts
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false }
  }
})
```

- [ ] **Step 2: Create `api.ts`**

```ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000"

type TokenProvider = () => Promise<string | null>

let tokenProvider: TokenProvider = async () => null

export function setTokenProvider(p: TokenProvider) { tokenProvider = p }

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) { super(message) }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await tokenProvider()
  const headers = new Headers(init.headers)
  headers.set("content-type", "application/json")
  if (token) headers.set("authorization", `Bearer ${token}`)

  const resp = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!resp.ok) {
    const text = await resp.text().catch(() => "")
    let body: unknown = text
    try { body = JSON.parse(text) } catch { /* not json */ }
    throw new ApiError(resp.status, body, `${resp.status} ${resp.statusText}`)
  }
  if (resp.status === 204) return undefined as T
  return (await resp.json()) as T
}
```

- [ ] **Step 3: Wire providers in `main.tsx`**

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import App from "./App"
import { queryClient } from "./lib/queryClient"
import "./styles/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
```

- [ ] **Step 4: Verify dev runs**

```bash
pnpm dev
```

Expected: page still renders. Stop.

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): API client + TanStack Query provider"
```

---

### Task F4: Auth0 integration

**Files:**
- Create: `frontend/.env.local.example`
- Modify: `frontend/src/main.tsx`
- Create: `frontend/src/auth/AuthGate.tsx`

- [ ] **Step 1: Create `.env.local.example`**

```
VITE_API_URL=http://localhost:5000
VITE_AUTH0_DOMAIN=your-tenant.eu.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=list4me-api
```

Instruct developer to copy to `.env.local` and fill.

- [ ] **Step 2: Wrap `main.tsx` with Auth0Provider**

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { Auth0Provider } from "@auth0/auth0-react"
import App from "./App"
import { queryClient } from "./lib/queryClient"
import "./styles/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Auth0Provider>
  </StrictMode>
)
```

- [ ] **Step 3: Create `AuthGate.tsx`**

```tsx
import { useAuth0 } from "@auth0/auth0-react"
import { useEffect, type ReactNode } from "react"
import { setTokenProvider } from "@/lib/api"
import { Button } from "@/components/ui/button"

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, loginWithRedirect, getAccessTokenSilently, logout } = useAuth0()

  useEffect(() => {
    setTokenProvider(async () => {
      if (!isAuthenticated) return null
      try { return await getAccessTokenSilently() } catch { return null }
    })
  }, [isAuthenticated, getAccessTokenSilently])

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-neutral-500">Betöltés…</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-3xl font-semibold">List4Me</h1>
          <p className="text-neutral-600">Kategorizált listák a háztartásodnak.</p>
          <Button onClick={() => loginWithRedirect()} className="w-full">Bejelentkezés</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {children}
      <button
        className="fixed top-3 right-3 text-xs text-neutral-500 hover:text-neutral-900"
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      >Kijelentkezés</button>
    </div>
  )
}
```

- [ ] **Step 4: Update `App.tsx`**

```tsx
import { AuthGate } from "@/auth/AuthGate"

export default function App() {
  return (
    <AuthGate>
      <div className="p-6">Bejelentkezve.</div>
    </AuthGate>
  )
}
```

- [ ] **Step 5: Commit** (Auth0 tenant config tested manually in Task H1 below)

```bash
git add frontend/
git commit -m "feat(frontend): Auth0 provider + AuthGate"
```

---

### Task F5: Household onboarding + main shell + router

**Files:**
- Create: `frontend/src/features/household/api.ts`
- Create: `frontend/src/auth/OnboardingHousehold.tsx`
- Create: `frontend/src/components/BottomNav.tsx`
- Create: `frontend/src/components/PageShell.tsx`
- Create: `frontend/src/router.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `household/api.ts`**

```ts
import { api } from "@/lib/api"

export type HouseholdMember = { id: string; displayName: string; role: string; joinedAt: string }
export type Household = { id: string; name: string; createdAt: string; members: HouseholdMember[] }
export type Invite = { token: string; inviteUrl: string; expiresAt: string }
export type InviteInfo = { token: string; householdName: string; expiresAt: string }

export const householdApi = {
  getMe: () => api<Household>("/api/households/me"),
  create: (name: string) => api<Household>("/api/households", {
    method: "POST", body: JSON.stringify({ name })
  }),
  update: (name: string) => api<void>("/api/households/me", {
    method: "PATCH", body: JSON.stringify({ name })
  }),
  createInvite: (email?: string) => api<Invite>("/api/households/me/invites", {
    method: "POST", body: JSON.stringify({ email: email ?? null })
  }),
  getInvite: (token: string) => api<InviteInfo>(`/api/invites/${token}`),
  acceptInvite: (token: string) => api<void>(`/api/invites/${token}/accept`, { method: "POST" })
}
```

- [ ] **Step 2: Create `OnboardingHousehold.tsx`**

```tsx
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { householdApi } from "@/features/household/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function OnboardingHousehold() {
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const [tab, setTab] = useState<"create" | "join">("create")

  const create = useMutation({
    mutationFn: () => householdApi.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", "me"] })
  })
  const accept = useMutation({
    mutationFn: () => householdApi.acceptInvite(token.trim()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["household", "me"] })
  })

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-xl font-semibold text-center">Kezdjük!</h2>

        <div className="flex gap-2">
          <Button variant={tab === "create" ? "primary" : "ghost"} onClick={() => setTab("create")} className="flex-1">
            Új háztartás
          </Button>
          <Button variant={tab === "join" ? "primary" : "ghost"} onClick={() => setTab("join")} className="flex-1">
            Meghívó elfogadása
          </Button>
        </div>

        {tab === "create" ? (
          <div className="space-y-3">
            <label className="block text-sm">Háztartás neve</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Pl. Kovács család" />
            <Button
              onClick={() => create.mutate()}
              disabled={!name.trim() || create.isPending}
              className="w-full"
            >Létrehoz</Button>
            {create.isError && <p className="text-danger text-sm">Sikertelen létrehozás</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm">Meghívó token vagy URL</label>
            <Input value={token} onChange={e => {
              const v = e.target.value.trim()
              const match = v.match(/([0-9a-f-]{36})$/i)
              setToken(match ? match[1] : v)
            }} placeholder="pl. 3f2b…-token" />
            <Button
              onClick={() => accept.mutate()}
              disabled={!token || accept.isPending}
              className="w-full"
            >Csatlakozás</Button>
            {accept.isError && <p className="text-danger text-sm">Érvénytelen vagy lejárt meghívó</p>}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `BottomNav.tsx`**

```tsx
import { NavLink } from "react-router"
import { LayoutGrid, ListChecks, ClipboardList, Settings } from "lucide-react"
import { cn } from "@/lib/cn"

const tabs = [
  { to: "/", label: "Kategóriák", icon: LayoutGrid },
  { to: "/lists", label: "Listák", icon: ListChecks },
  { to: "/templates", label: "Sablonok", icon: ClipboardList },
  { to: "/settings", label: "Beállítások", icon: Settings }
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white/90 backdrop-blur
                    pb-[env(safe-area-inset-bottom)] z-30 dark:bg-neutral-900/90">
      <ul className="flex">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center py-2 gap-0.5 text-xs",
                isActive ? "text-brand" : "text-neutral-500"
              )}
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 4: Create `PageShell.tsx`**

```tsx
import type { ReactNode } from "react"
import { BottomNav } from "./BottomNav"

export function PageShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b dark:bg-neutral-900/90">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 5: Create `router.tsx`**

```tsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { householdApi } from "@/features/household/api"
import { OnboardingHousehold } from "@/auth/OnboardingHousehold"
import { PageShell } from "@/components/PageShell"
import { ApiError } from "@/lib/api"

function CategoriesScreen() { return <PageShell title="Kategóriák"><div>Kategóriák jönnek.</div></PageShell> }
function ListsScreen() { return <PageShell title="Listák"><div>Listák jönnek.</div></PageShell> }
function TemplatesScreen() { return <PageShell title="Sablonok"><div>Sablonok jönnek.</div></PageShell> }
function SettingsScreen() { return <PageShell title="Beállítások"><div>Beállítások jönnek.</div></PageShell> }

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["household", "me"],
    queryFn: householdApi.getMe,
    retry: (n, err) => (err instanceof ApiError && err.status === 404 ? false : n < 1)
  })
  if (isLoading) return <div className="min-h-screen grid place-items-center">Betöltés…</div>
  if (error instanceof ApiError && error.status === 404) return <OnboardingHousehold />
  if (error) return <div className="p-6 text-danger">Hiba: {(error as Error).message}</div>
  if (!data) return <OnboardingHousehold />
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    element: <OnboardingGate><Outlet /></OnboardingGate>,
    children: [
      { path: "/", element: <CategoriesScreen /> },
      { path: "/lists", element: <ListsScreen /> },
      { path: "/templates", element: <TemplatesScreen /> },
      { path: "/settings", element: <SettingsScreen /> },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
])

import { Outlet } from "react-router"

export function AppRouter() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 6: Update `App.tsx`**

```tsx
import { AuthGate } from "@/auth/AuthGate"
import { AppRouter } from "@/router"

export default function App() {
  return (
    <AuthGate>
      <AppRouter />
    </AuthGate>
  )
}
```

- [ ] **Step 7: Manual smoke test**

Prep required environment:
1. Ensure backend is running (`dotnet run --project backend/src/List4Me.Api --urls http://localhost:5000`)
2. Auth0: set up an Auth0 tenant (see spec §8), fill `frontend/.env.local`, set backend `Auth0__Domain` / `Auth0__Audience` in `appsettings.Development.json`
3. Frontend: `pnpm dev`
4. Visit `http://localhost:5173` → login redirect → back → onboarding screen → create household → shell appears with 4 tabs

Expected: full flow works.

- [ ] **Step 8: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): router + onboarding + bottom nav shell"
```

---

## Phase G — Frontend Categories feature

### Task G1: Categories API + icon set + types

**Files:**
- Create: `frontend/src/features/categories/types.ts`
- Create: `frontend/src/features/categories/api.ts`
- Create: `frontend/src/lib/icons.ts`

- [ ] **Step 1: Create `types.ts`**

```ts
export type Category = {
  id: string
  name: string
  iconKey: string
  parentCategoryId: string | null
  completedLabel: string
  sortOrder: number
  subcategories: Category[]
}

export type CreateCategoryPayload = {
  name: string
  iconKey: string
  parentCategoryId?: string | null
  completedLabel?: string
}

export type UpdateCategoryPayload = {
  name: string
  iconKey: string
  completedLabel: string
  sortOrder?: number
}
```

- [ ] **Step 2: Create `api.ts`**

```ts
import { api } from "@/lib/api"
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "./types"

export const categoriesApi = {
  list: () => api<Category[]>("/api/categories"),
  create: (p: CreateCategoryPayload) =>
    api<Category>("/api/categories", { method: "POST", body: JSON.stringify(p) }),
  update: (id: string, p: UpdateCategoryPayload) =>
    api<void>(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(p) }),
  remove: (id: string, force = false) =>
    api<void>(`/api/categories/${id}${force ? "?force=true" : ""}`, { method: "DELETE" })
}
```

- [ ] **Step 3: Create `icons.ts`**

```ts
import {
  ShoppingCart, ShoppingBag, Utensils, Apple, Carrot, Beef, Fish,
  Milk, Coffee, Wine, Beer, Cookie, Cake, Pizza, Sandwich,
  Refrigerator, Snowflake, Thermometer, Flame,
  Palmtree, Sun, Umbrella, Tent, Backpack, Camera, Car, Plane, Luggage,
  Briefcase, Gift, Heart, Star,
  Pill, Syringe, Baby, Dog, Cat,
  Hammer, Wrench, Screwdriver, Paintbrush,
  Book, Pencil, Flower, Leaf, Trees,
  WashingMachine, Shirt,
  Bath, ShowerHead,
  List, Clipboard, ClipboardList, CheckSquare,
  Home, Bed, Sofa, Lamp,
  Package, Box, Layers,
  type LucideIcon
} from "lucide-react"

export const iconRegistry: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart, "shopping-bag": ShoppingBag, "utensils": Utensils,
  "apple": Apple, "carrot": Carrot, "beef": Beef, "fish": Fish,
  "milk": Milk, "coffee": Coffee, "wine": Wine, "beer": Beer,
  "cookie": Cookie, "cake": Cake, "pizza": Pizza, "sandwich": Sandwich,
  "refrigerator": Refrigerator, "snowflake": Snowflake,
  "thermometer": Thermometer, "flame": Flame,
  "palm-tree": Palmtree, "sun": Sun, "umbrella": Umbrella, "tent": Tent,
  "backpack": Backpack, "camera": Camera, "car": Car, "plane": Plane, "luggage": Luggage,
  "briefcase": Briefcase, "gift": Gift, "heart": Heart, "star": Star,
  "pill": Pill, "syringe": Syringe, "baby": Baby, "dog": Dog, "cat": Cat,
  "hammer": Hammer, "wrench": Wrench, "screwdriver": Screwdriver, "paintbrush": Paintbrush,
  "book": Book, "pencil": Pencil, "flower": Flower, "leaf": Leaf, "trees": Trees,
  "washing-machine": WashingMachine, "shirt": Shirt, "shoe": Shirt, // Lucide has no shoe icon
  "bath": Bath, "shower-head": ShowerHead,
  "list": List, "clipboard": Clipboard, "clipboard-list": ClipboardList, "check-square": CheckSquare,
  "home": Home, "bed": Bed, "sofa": Sofa, "lamp": Lamp,
  "package": Package, "box": Box, "layers": Layers
}

export const iconKeys = Object.keys(iconRegistry).sort()

export function getIcon(key: string): LucideIcon {
  return iconRegistry[key] ?? Package
}
```

Note: keep this in sync with backend `IconKeys.cs`. If a key is missing on frontend, backend still accepts it → renders as `Package` fallback.

- [ ] **Step 4: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): categories API + Lucide icon registry"
```

---

### Task G2: IconPicker component

**Files:**
- Create: `frontend/src/features/categories/IconPicker.tsx`

- [ ] **Step 1: Create `IconPicker.tsx`**

```tsx
import { useMemo, useState } from "react"
import { getIcon, iconKeys } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/cn"

export function IconPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  const [q, setQ] = useState("")
  const filtered = useMemo(
    () => iconKeys.filter(k => k.toLowerCase().includes(q.toLowerCase())),
    [q]
  )
  return (
    <div className="space-y-2">
      <Input placeholder="Ikon keresés…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1 border rounded-lg">
        {filtered.map(k => {
          const Icon = getIcon(k)
          const active = k === value
          return (
            <button
              type="button"
              key={k}
              onClick={() => onChange(k)}
              title={k}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center",
                "hover:bg-neutral-100 transition-colors",
                active && "ring-2 ring-brand bg-blue-50"
              )}
            >
              <Icon className="size-6" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): IconPicker component"
```

---

### Task G3: CategoryEditor + CategoryCard + CategoryList screen

**Files:**
- Create: `frontend/src/features/categories/CategoryEditor.tsx`
- Create: `frontend/src/features/categories/CategoryCard.tsx`
- Create: `frontend/src/features/categories/CategoryList.tsx`
- Modify: `frontend/src/router.tsx`

- [ ] **Step 1: Create `CategoryEditor.tsx`**

```tsx
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconPicker } from "./IconPicker"
import { categoriesApi } from "./api"
import type { Category } from "./types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  parentCategoryId?: string | null
}

export function CategoryEditor({ open, onOpenChange, category, parentCategoryId }: Props) {
  const qc = useQueryClient()
  const isEdit = !!category
  const [name, setName] = useState(category?.name ?? "")
  const [iconKey, setIconKey] = useState(category?.iconKey ?? "shopping-cart")
  const [completedLabel, setCompletedLabel] = useState(category?.completedLabel ?? "Kész")

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "")
      setIconKey(category?.iconKey ?? "shopping-cart")
      setCompletedLabel(category?.completedLabel ?? "Kész")
    }
  }, [open, category])

  const save = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        await categoriesApi.update(category!.id, {
          name, iconKey, completedLabel
        })
      } else {
        await categoriesApi.create({
          name, iconKey, completedLabel,
          parentCategoryId: parentCategoryId ?? null
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      onOpenChange(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{isEdit ? "Kategória szerkesztése" : "Új kategória"}</DialogTitle>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Név</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Ikon</label>
            <IconPicker value={iconKey} onChange={setIconKey} />
          </div>
          <div>
            <label className="block text-sm mb-1">"Készre jelölve" címke</label>
            <Input value={completedLabel} onChange={e => setCompletedLabel(e.target.value)}
                   placeholder="Pl. Megvettem / Elfogyott / Bepakolva" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">Mégse</Button>
            <Button
              onClick={() => save.mutate()}
              disabled={!name.trim() || save.isPending}
              className="flex-1"
            >{isEdit ? "Mentés" : "Létrehoz"}</Button>
          </div>
          {save.isError && <p className="text-danger text-sm">Hiba: {(save.error as Error).message}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create `CategoryCard.tsx`**

```tsx
import { getIcon } from "@/lib/icons"
import type { Category } from "./types"

export function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  const Icon = getIcon(category.iconKey)
  return (
    <button
      onClick={onClick}
      className="aspect-square w-full rounded-2xl bg-white border shadow-sm
                 flex flex-col items-center justify-center gap-2 p-4
                 hover:shadow-md active:scale-[.98] transition
                 dark:bg-neutral-900"
    >
      <Icon className="size-10 text-brand" />
      <span className="text-sm font-medium text-center line-clamp-2">{category.name}</span>
      {category.subcategories.length > 0 && (
        <span className="text-xs text-neutral-500">{category.subcategories.length} alkategória</span>
      )}
    </button>
  )
}
```

- [ ] **Step 3: Create `CategoryList.tsx`**

```tsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { PageShell } from "@/components/PageShell"
import { Button } from "@/components/ui/button"
import { categoriesApi } from "./api"
import type { Category } from "./types"
import { CategoryCard } from "./CategoryCard"
import { CategoryEditor } from "./CategoryEditor"

export function CategoryListScreen() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["categories"], queryFn: categoriesApi.list
  })
  const [editing, setEditing] = useState<Category | undefined>()
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Category | undefined>()

  const del = useMutation({
    mutationFn: (payload: { id: string; force: boolean }) =>
      categoriesApi.remove(payload.id, payload.force),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setSelected(undefined) }
  })

  return (
    <PageShell title="Kategóriák">
      {isLoading && <div className="text-neutral-500">Betöltés…</div>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {data.map(c => (
              <CategoryCard key={c.id} category={c} onClick={() => setSelected(c)} />
            ))}
          </div>

          <button
            onClick={() => setCreating(true)}
            className="fixed bottom-24 right-4 z-20 size-14 rounded-full bg-brand text-white
                       shadow-lg flex items-center justify-center hover:bg-blue-700"
            aria-label="Új kategória"
          >
            <Plus className="size-6" />
          </button>
        </>
      )}

      {creating && (
        <CategoryEditor open={creating} onOpenChange={setCreating} parentCategoryId={null} />
      )}

      {selected && (
        <SelectedCategoryDrawer
          category={selected}
          onClose={() => setSelected(undefined)}
          onEdit={() => { setEditing(selected); setSelected(undefined) }}
          onDelete={(force) => del.mutate({ id: selected.id, force })}
          deleteError={del.error as { status?: number } | null}
        />
      )}

      {editing && (
        <CategoryEditor
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(undefined)}
          category={editing}
        />
      )}
    </PageShell>
  )
}

function SelectedCategoryDrawer({
  category, onClose, onEdit, onDelete, deleteError
}: {
  category: Category
  onClose: () => void
  onEdit: () => void
  onDelete: (force: boolean) => void
  deleteError: { status?: number } | null
}) {
  const [confirmForce, setConfirmForce] = useState(false)
  return (
    <div className="fixed inset-0 bg-black/40 z-40 grid place-items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-2xl p-4 space-y-3 dark:bg-neutral-900
                   pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onEdit} className="flex-1">
            <Pencil className="size-4 mr-2" /> Szerkeszt
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmForce) onDelete(true)
              else onDelete(false)
            }}
            className="flex-1"
          >
            <Trash2 className="size-4 mr-2" />
            {confirmForce ? "Igen, törlés" : "Törlés"}
          </Button>
        </div>
        {deleteError?.status === 409 && !confirmForce && (
          <p className="text-sm text-neutral-600">
            A kategória nem üres. Ha biztosan törölnéd, koppints újra a Törlés-re
            (alkategóriák és termékek is törlődnek).
            <button
              className="block text-brand mt-2"
              onClick={() => setConfirmForce(true)}
            >Kaszkádolt törlés bekapcsolása</button>
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Wire in `router.tsx`**

Replace the placeholder `CategoriesScreen`:

```tsx
import { CategoryListScreen } from "@/features/categories/CategoryList"
```

Use `<CategoryListScreen />` in the `"/"` route element.

- [ ] **Step 5: Manual smoke test**

Run backend + frontend + dev Postgres. Log in. New household → see 4 seeded categories. Tap `+` → new category dialog. Try creating, editing, deleting (with and without children).

- [ ] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): CategoryList screen + Editor + Card + delete drawer"
```

---

### Task G4: HouseholdSettings screen (view members + create invite)

**Files:**
- Create: `frontend/src/features/household/HouseholdSettings.tsx`
- Create: `frontend/src/features/household/InviteAcceptPage.tsx`
- Modify: `frontend/src/router.tsx`

- [ ] **Step 1: Create `HouseholdSettings.tsx`**

```tsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth0 } from "@auth0/auth0-react"
import { Copy, UserPlus } from "lucide-react"
import { PageShell } from "@/components/PageShell"
import { Button } from "@/components/ui/button"
import { householdApi, type Invite } from "./api"

export function HouseholdSettingsScreen() {
  const qc = useQueryClient()
  const { logout } = useAuth0()
  const { data: household } = useQuery({
    queryKey: ["household", "me"], queryFn: householdApi.getMe
  })
  const [invite, setInvite] = useState<Invite | null>(null)
  const createInvite = useMutation({
    mutationFn: () => householdApi.createInvite(),
    onSuccess: setInvite
  })

  return (
    <PageShell title="Beállítások">
      {household && (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-medium text-neutral-500 mb-2">HÁZTARTÁS</h2>
            <div className="rounded-lg border p-3 bg-white dark:bg-neutral-900">
              <div className="font-medium">{household.name}</div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-neutral-500 mb-2">TAGOK</h2>
            <ul className="rounded-lg border bg-white divide-y dark:bg-neutral-900">
              {household.members.map(m => (
                <li key={m.id} className="p-3 flex justify-between">
                  <span>{m.displayName}</span>
                  <span className="text-xs text-neutral-500">{m.role === "Owner" ? "Tulajdonos" : "Tag"}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-medium text-neutral-500 mb-2">MEGHÍVÓ</h2>
            <Button onClick={() => createInvite.mutate()} disabled={createInvite.isPending}>
              <UserPlus className="size-4 mr-2" />Új meghívó
            </Button>
            {invite && (
              <div className="mt-3 rounded-lg border p-3 bg-white dark:bg-neutral-900">
                <p className="text-sm break-all">{invite.inviteUrl}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(invite.inviteUrl)}
                  className="mt-2 text-brand text-sm inline-flex items-center gap-1"
                >
                  <Copy className="size-4" /> Másolás
                </button>
              </div>
            )}
          </section>

          <Button variant="ghost" onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Kijelentkezés
          </Button>
        </div>
      )}
    </PageShell>
  )
}
```

- [ ] **Step 2: Create `InviteAcceptPage.tsx`**

```tsx
import { useParams, useNavigate } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { householdApi } from "./api"

export function InviteAcceptPage() {
  const { token = "" } = useParams()
  const nav = useNavigate()
  const qc = useQueryClient()

  const info = useQuery({
    queryKey: ["invite", token],
    queryFn: () => householdApi.getInvite(token),
    retry: false
  })

  const accept = useMutation({
    mutationFn: () => householdApi.acceptInvite(token),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["household", "me"] })
      nav("/", { replace: true })
    }
  })

  if (info.isLoading) return <div className="min-h-screen grid place-items-center">Betöltés…</div>
  if (info.isError) return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <p>Érvénytelen vagy lejárt meghívó.</p>
    </div>
  )

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-xl font-semibold">Csatlakozás</h1>
        <p>Meghívtak a(z) <strong>{info.data!.householdName}</strong> háztartáshoz.</p>
        <Button onClick={() => accept.mutate()} disabled={accept.isPending} className="w-full">
          Elfogadom
        </Button>
        {accept.isError && <p className="text-danger text-sm">Sikertelen elfogadás</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire routes**

Update `router.tsx`:

```tsx
import { CategoryListScreen } from "@/features/categories/CategoryList"
import { HouseholdSettingsScreen } from "@/features/household/HouseholdSettings"
import { InviteAcceptPage } from "@/features/household/InviteAcceptPage"
```

Add invite route **outside** the `OnboardingGate` (an incoming invitee doesn't have a household yet):

```tsx
const router = createBrowserRouter([
  { path: "/invite/:token", element: <InviteAcceptPage /> },
  {
    element: <OnboardingGate><Outlet /></OnboardingGate>,
    children: [
      { path: "/", element: <CategoryListScreen /> },
      { path: "/lists", element: <ListsScreen /> },
      { path: "/templates", element: <TemplatesScreen /> },
      { path: "/settings", element: <HouseholdSettingsScreen /> },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
])
```

- [ ] **Step 4: Manual smoke test**

- Log in as user A → create household → Settings → New invite → copy URL
- Open incognito, paste URL → Auth0 login as user B → invite accept → land on home → Settings shows both members

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): Settings screen + invite creation + invite accept flow"
```

---

## Phase H — Verification

### Task H1: Full integration test run

- [ ] **Step 1: Backend tests**

```bash
dotnet test backend/List4Me.sln
```

Expected: all pass.

- [ ] **Step 2: Frontend build**

```bash
cd frontend && pnpm build
```

Expected: build success.

- [ ] **Step 3: End-to-end manual smoke**

Follow the flow described in Task G4 Step 4. Confirm each checkbox:

- [ ] Login redirect via Auth0
- [ ] Onboarding shows for new user
- [ ] Household creation succeeds
- [ ] 4 seeded categories render with correct Lucide icons
- [ ] Can create, edit, delete categories
- [ ] Delete with subcategories prompts for cascade
- [ ] Settings tab shows members and lets you create an invite
- [ ] Second browser can accept the invite

### Task H2: Docs polish

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Expand README with actual setup**

```markdown
# List4Me

Kategorizált listakezelő háztartásoknak. Monorepo: `/backend` (.NET 10 Minimal API + EF Core), `/frontend` (React + Vite + TS + Tailwind).

## Előfeltételek
- .NET 10 SDK
- Node 20+ és pnpm 9+
- Docker Desktop
- Auth0 tenant (dev application + API resource)

## Első futtatás
1. `docker compose up -d postgres`
2. Backend:
   ```
   cd backend
   dotnet ef database update --project src/List4Me.Api
   dotnet run --project src/List4Me.Api --urls http://localhost:5000
   ```
3. Frontend:
   ```
   cd frontend
   cp .env.local.example .env.local   # töltsd ki az Auth0 kulcsokat
   pnpm install
   pnpm dev
   ```
4. Nyisd meg: `http://localhost:5173`

## Backend tesztek
```
dotnet test backend/List4Me.sln
```
(Testcontainers Postgres automatikusan indul, Docker kell.)

## Spec
`docs/superpowers/specs/2026-07-02-list4me-design.md`

## Következő plan
`docs/superpowers/plans/` — Plan 2 (Products + Lists + Templates) és Plan 3 (Realtime + E2E + Deploy) jönnek.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README with quickstart and testing instructions"
```

---

## Definition of Done for Plan 1

- All backend integration tests pass
- Frontend builds without errors
- Manual smoke checklist in Task H1 all boxes checked
- User can log in via Auth0, create a household, invite another user, and CRUD categories via the mobile-first UI
- Seed data creates 4 categories on new household creation
- Cross-household isolation enforced (integration test proves this)

## What's NOT in this plan (comes later)

- **Plan 2:** Products CRUD + favorites, Lists + ListItems (with swipe), Templates
- **Plan 3:** SignalR realtime, Playwright E2E suite, Docker + Railway deploy, CI/CD workflows

---

## Completion log (2026-07-04)

**Status:** All 41 tasks (A1 → H2) complete. Branch `plan1-foundation` pushed to `origin`, PR open against `main`.

**Verification:**

- Backend: `dotnet test backend/List4Me.slnx` → **20/20 pass** in ~16s (Testcontainers Postgres 17).
- Frontend: `pnpm --filter frontend build` → clean build, 608 KB bundle (189 KB gzipped).
- 39 commits across the branch, each reviewed by a two-stage subagent pass (spec compliance + code quality).

**Deviations from the plan (documented for future planners):**

- **Backend port:** Kestrel binds to `http://localhost:5058` (from `launchSettings.json`), not `:5000` as some snippets assumed. `frontend/src/lib/api.ts` fallback and `.env.local.example` corrected to `:5058`.
- **Postgres port:** `docker-compose.yml` maps `5433:5432` to avoid clashing with a local PG18 instance on `:5432`. README quickstart reflects this.
- **Solution file:** .NET 10 defaults to `.slnx` (XML) — commands use `backend/List4Me.slnx`, not `.sln`.
- **`Screwdriver` icon:** Not exported by the installed `lucide-react` version. Fallback: `"screwdriver": Wrench` in `frontend/src/lib/icons.ts`. The kebab-case key is preserved to match `backend/.../IconKeys.cs`.
- **`erasableSyntaxOnly` incompatibility:** TS parameter properties (`constructor(public status, ...)`) don't compile under this repo's tsconfig. `ApiError` was rewritten with explicit field declarations + assignment in the constructor body.
- **Router topology fix:** `/invite/:token` lives as a **top-level sibling** of `OnboardingGate` (not a child), so an invitee without a household can accept the invite before hitting the onboarding wall.
- **Drawer a11y hardening:** `SelectedCategoryDrawer` gained `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and Escape-key dismiss (spec-review finding, not in original plan snippet).
- **Stale delete-error bug:** `del.reset()` is now called on drawer close and on edit-out paths — otherwise a 409 error on category A would leak into the drawer of category B (spec-review finding).
- **Label associations:** `OnboardingHousehold` inputs now use `htmlFor` / `id` pairs (spec-review finding).

**Known caveats carried forward to Plan 2:**

- Two transitive CVEs to bump: `Microsoft.OpenApi 2.0.0`, `System.Security.Cryptography.Xml 9.0.0`.
- Two pre-existing nullable warnings in `backend/tests/.../CategoryEndpointTests.cs:73,184` — non-blocking, worth a follow-up.
- Manual smoke checklist (Task H1) still needs a human pass once the user configures an Auth0 tenant and fills `frontend/.env.local`.








