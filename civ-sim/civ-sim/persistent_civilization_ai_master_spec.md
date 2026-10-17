# Persistent Civilization Simulation

## AI Implementation Master Specification

**Document type:** Product, simulation, architecture, and implementation
specification\
**Status:** Initial master specification\
**Audience:** AI coding agents and human maintainers\
**Primary objective:** Build a persistent multiplayer civilization
simulation incrementally, reliably, and with enough documentation that
different AI models can continue work without depending on previous chat
history.

------------------------------------------------------------------------

## 1. Instructions to the Implementing AI

You are implementing a long-running software project, not producing a
one-shot demo. Correctness, continuity, security, and coherent systems
matter more than the number of features added per session.

### Mandatory working rules

1.  **Inspect before changing.** Examine the existing repository, its
    instructions, current architecture, tests, and project status before
    editing files. Do not assume an empty repository.
2.  **Work in bounded increments.** Implement one coherent task or
    milestone at a time. Avoid massive rewrites unless explicitly
    required and justified.
3.  **Preserve working behavior.** Do not remove existing features or
    silently change agreed rules to simplify implementation.
4.  **Make the game testable.** Add or update automated tests for
    simulation rules, permissions, timing, persistence, and visibility.
5.  **Verify claims.** Run the available tests, linting, type checks,
    build, and relevant manual checks. Never claim that something works
    if it was not tested.
6.  **Keep the documentation current.** Update `CURRENT_STATE.md`, the
    relevant system documentation, and `CHANGELOG.md` whenever
    implementation changes materially.
7.  **Leave a handoff.** At the end of each task, record what changed,
    what was tested, known defects, and the next concrete task.
8.  **Do not invent external services or credentials.** Explain required
    accounts, secrets, quotas, deployment steps, and costs. Never commit
    secrets.
9.  **Prefer simple, explicit systems.** Use clear data structures and
    small modules. Avoid unnecessary frameworks, premature abstractions,
    and giant files.
10. **Do not implement the entire game in one pass.** Establish a
    playable vertical slice first, then extend it.

If the repository has a different established architecture, assess it
and document a migration plan rather than replacing it automatically.

------------------------------------------------------------------------

## 2. Product Vision

Build a persistent, real-time, multiplayer civilization simulation in
which the world continues to evolve whether or not any particular player
is online.

Players may form factions, join existing factions, or remain
independent. A player can act as a ruler, trader, farmer, engineer,
soldier, inventor, landowner, or another supported role. Factions are
not the only meaningful economic actors: individual citizens and
businesses should be able to own assets, trade, work, travel, and make
independent decisions within the rules.

The simulation should create stories from interacting systems rather
than scripted outcomes. Examples include:

-   A merchant departs before a war is announced and learns about it
    late---or never.
-   A faction has territory but does not know the exact locations of its
    rival's armies or factories.
-   A river settlement becomes an industrial center because it has
    reliable water power.
-   A player invents a more efficient mill, manufactures it, sells the
    design, and earns a reputation.
-   A faction with a large army loses a campaign because it cannot
    supply its troops.
-   A drought causes food prices to rise, migration to increase, and
    political instability to spread.
-   A citizen changes employers or faction because another opportunity
    is better.

### Design pillars

1.  **Persistent world:** state survives disconnections, reloads, and
    deployments.
2.  **Non-instantaneous actions:** travel, construction, production,
    communication, and military operations take time.
3.  **Player agency:** players can issue valid actions at any time,
    subject to rules, resources, permissions, and action duration.
4.  **Information asymmetry:** knowledge is individual and socially
    transmitted, not automatically shared with every player.
5.  **Emergent economy:** resources, labor, geography, logistics, and
    demand interact.
6.  **Meaningful engineering:** player-authored designs can become
    functioning objects through a constrained, validated schematic
    system.
7.  **Understandable simulation:** players can inspect explanations for
    production, shortages, movement, combat, and economic outcomes.
8.  **AI-maintainable codebase:** each system is documented, modular,
    testable, and implementable in small tasks.

### Design exclusions for the initial version

-   No unrestricted player-uploaded executable code running on the
    server.
-   No client-authoritative resources, combat results, ownership, or
    hidden information.
-   No requirement to simulate every citizen or every unit of air and
    water at full physical resolution.
-   No instant long-distance movement, instant mass construction, or
    cost-free manufacturing.
-   No assumption that a faction leader owns every citizen's personal
    property.
-   No promise of infinite free hosting or unlimited AI coding-model
    usage. Keep the architecture efficient and portable.

------------------------------------------------------------------------

## 3. Core World and Time Model

### 3.1 Persistent world

The world has a stable identity and authoritative state. It contains
terrain, elevation, water systems, climate, resource deposits,
settlements, roads, buildings, citizens, businesses, factions,
inventories, machines, armies, diplomatic relations, and historical
events.

A world must not depend on any individual browser remaining open.
Disconnecting must not pause or reset the world.

### 3.2 Continuous-time interaction

Players may submit actions at any time. The system validates and records
the action, then resolves its consequences immediately or schedules them
for a future time.

Examples:

-   A diplomatic declaration may become effective immediately after
    validation.
-   A merchant's journey takes a calculated duration.
-   A building consumes resources and progresses over time.
-   A factory produces only while its required inputs, labor, and
    operating conditions are available.
-   An army advances over a route and may encounter events during the
    journey.
-   A message travels through an appropriate communication channel and
    is not received instantaneously at arbitrary distances.

### 3.3 Simulation clock and scheduling

Use an authoritative server-side simulation clock. Separate:

-   **Real time:** actual elapsed wall-clock time.
-   **World time:** the date and time in the simulated world.
-   **Command time:** when an action was submitted and accepted.
-   **Effect time:** when its result occurs or becomes effective.

Use event scheduling and different update frequencies. Examples of
scheduled events include arrival, construction completion, resource
depletion, crop harvest, treaty expiration, and disease progression.
Frequently changing systems may update at a fixed cadence; slow systems
should not be recalculated unnecessarily.

The initial world-time conversion and tick interval are configuration
decisions, not assumptions to hard-code throughout the codebase. Provide
a configurable, testable clock. A suggested starting point is a short
server update interval with a slower world-time scale, but tune this
with actual playtests.

### 3.4 Determinism and concurrency

Given the same initial state, accepted commands, configuration, and
random seed, simulation outcomes should be reproducible wherever
practical.

-   Use a defined ordering for conflicting actions.
-   Validate all costs and prerequisites at execution time, not only
    when the UI displays an action.
-   Apply state changes atomically where the persistence system supports
    it.
-   Prevent duplicate command submission from charging costs twice.
-   Record a unique command ID and outcome for important operations.
-   Handle simultaneous orders for the same stock, building slot,
    territory, or character.
-   Use server timestamps and authoritative ordering; do not trust
    client clocks.

------------------------------------------------------------------------

## 4. Multiplayer Architecture and Static Frontend

### 4.1 Required architecture

Use a static web frontend for presentation and player interaction,
backed by a persistent service that owns authoritative shared state.

A static frontend can contain HTML, CSS, JavaScript, images, and
client-side presentation logic. It cannot, by itself, provide secure,
shared, persistent multiplayer state. A backend or equivalent trusted
authority is required.

The backend must own:

-   Identity and authorization checks.
-   Accepted commands and action costs.
-   World clock and scheduled events.
-   Resource inventories and transactions.
-   Movement, production, combat, ownership, and diplomatic outcomes.
-   Visibility filtering and private information.
-   Persistence, recovery, and audit/event history.

A free-tier backend may be suitable for a prototype, but its current
quotas, execution limits, storage, concurrency model, and deployment
requirements must be verified before committing to a provider. Keep the
simulation core sufficiently independent of the hosting provider to
allow migration.

### 4.2 Security principles

-   Never send hidden state to a client and rely on the UI to hide it.
-   Never trust client-provided resource counts, prices, locations,
    combat results, timestamps, permissions, or ownership.
-   Validate all inputs on the server, including schematic definitions.
-   Use access control for faction-only, business-only, private, and
    public records.
-   Protect against replayed commands, duplicate transactions,
    unauthorized faction actions, and race conditions.
-   Rate-limit costly operations and validate uploaded content.
-   Keep credentials and server secrets out of client code and version
    control.

### 4.3 Suggested modular boundaries

Adapt these to the existing repository and chosen stack. Do not force a
framework solely to match this list.

-   `world`: world creation, terrain, regions, geography.
-   `clock`: simulation time, scheduled events, pause/speed controls
    where permitted.
-   `commands`: command validation, authorization, idempotency,
    outcomes.
-   `population`: citizens, cohorts, needs, labor, migration, births and
    deaths.
-   `economy`: resources, production recipes, consumption, markets,
    contracts.
-   `logistics`: routes, transport capacity, travel duration, cargo and
    supply.
-   `factions`: membership, governance, territory, laws, public assets.
-   `diplomacy`: relations, treaties, declarations, negotiations.
-   `military`: recruitment, equipment, movement, supply, combat and
    peace.
-   `knowledge`: observations, reports, rumors, messages, information
    access.
-   `engineering`: components, schematic validation, machine behavior.
-   `environment`: climate, seasons, rivers, wind and natural events.
-   `persistence`: database access, migrations, snapshots and recovery.
-   `api`: authenticated endpoints or commands.
-   `ui`: screens, shared components, map, dashboards and reports.
-   `tests`: unit, integration, simulation, security and regression
    tests.

The simulation core should not depend on UI components. UI code should
not directly mutate authoritative world state.

------------------------------------------------------------------------

## 5. World Geography and Environment

### 5.1 Geography

The map should contain, as supported by the chosen world scale:

-   Terrain type and elevation.
-   Rivers, lakes, watersheds, coastlines, and water access.
-   Climate regions and seasonal conditions.
-   Fertility, vegetation, and resource deposits.
-   Settlements, roads, bridges, ports, canals, and other
    infrastructure.
-   Movement costs and visibility modifiers.

Geography should influence settlement placement, agriculture, industry,
trade, travel, defense, and engineering.

### 5.2 Public geography versus hidden activity

The physical map and known geographic facts are distinct from current
activity on the map.

A faction's territorial expansion and claimed borders can be publicly
known, while the following may remain hidden:

-   Exact building locations or building functions.
-   Production rates and inventories.
-   Garrison sizes and army positions.
-   Military orders and routes.
-   Private diplomatic negotiations.
-   Business inventories and cargo contents.

Define each piece of information's visibility policy explicitly. Do not
implement fog of war as one generic boolean for an entire map.

### 5.3 Water model

Start with a computationally efficient hydrological model:

-   Elevation determines plausible downhill flow.
-   Watersheds and drainage routes determine river networks.
-   River flow varies with rainfall, season, upstream contributions, and
    withdrawals.
-   Water may be consumed or diverted for irrigation, industry, and
    settlements.
-   Dams and canals can change flow, subject to defined construction and
    engineering rules.
-   Floods and droughts may affect settlements and production.

The first implementation can use region- or edge-based flow estimates
rather than a full fluid simulation.

### 5.4 Wind and weather

Model regional wind speed and direction, seasonal variation, weather,
and terrain effects at a level appropriate to gameplay. Weather affects
sailing, windmills, wind turbines, drying, visibility, agriculture, and
hazards as those systems are introduced.

Do not simulate computationally expensive fluid dynamics unless a later,
tested requirement justifies it.

------------------------------------------------------------------------

## 6. Citizens, Factions, and Property

### 6.1 Factions

A player should be able to form a faction when the game rules permit it,
rather than only at world creation. A faction has a name, identity,
membership, territorial claims, public assets, governance rules,
diplomatic relations, and a record of actions.

Define how faction creation is limited, if at all, to prevent spam or
exploitative repeated founding. Such limits should be explicit game
rules rather than arbitrary hidden behavior.

### 6.2 Player citizens

Players may act as individual citizens. They should be able to perform
supported professions and activities, such as:

-   Working for wages or contracts.
-   Operating a business.
-   Buying, selling, transporting, or storing goods.
-   Owning permitted assets.
-   Traveling and migrating.
-   Joining or leaving factions according to membership rules.
-   Designing, manufacturing, licensing, or selling schematics.
-   Serving in military or public roles if authorized.

### 6.3 Simulated citizens

NPC citizens should provide a functioning society without requiring
expensive AI inference for every decision. Use deterministic rules and
utility scoring for routine choices.

NPC behavior may include:

-   Seeking food, shelter, work, and safety.
-   Responding to wages, prices, shortages, and local opportunities.
-   Migrating when local conditions deteriorate.
-   Supplying routine labor and consuming goods.
-   Running basic businesses or fulfilling predefined roles.
-   Reacting to faction policies, war, disasters, and information they
    have received.

NPCs must be subject to the same resource constraints as players
wherever practical. They must not create free goods or know hidden facts
without a defined source of information.

### 6.4 Property and authority

Keep these concepts separate:

-   Personal ownership.
-   Business ownership.
-   Public or faction ownership.
-   Land ownership.
-   Territorial sovereignty.
-   Access rights and permissions.

A faction leader must not automatically have access to all personal
inventories. Define taxes, seizure, confiscation, contracts, property
transfer, inheritance or succession, and legal disputes explicitly.

### 6.5 Population simulation

Begin with population cohorts or aggregated citizens rather than
individually simulating every person. Model births, deaths, food needs,
labor participation, migration, and basic living conditions. Add age
structure, health, skills, education, and social classes as separate,
testable expansions.

Population growth must depend on constraints such as food, housing,
health, and available land. Avoid unbounded exponential growth or
arbitrary caps without a documented rationale.

------------------------------------------------------------------------

## 7. Economy, Production, and Logistics

### 7.1 Resource model

Each resource must have a clear definition, unit, storage behavior,
production sources, consumption sinks, and economic role.

Avoid resource types that exist only to inflate complexity. Begin with a
small set, such as food, timber, stone, ore, metal, fuel, tools, and
currency, then add resources only when they create a meaningful
production chain or decision.

### 7.2 Production recipes

A production process should define:

-   Required inputs and quantities.
-   Labor and skill requirements.
-   Required equipment and infrastructure.
-   Production duration and output.
-   Operating conditions and efficiency.
-   Waste, by-products, wear, or maintenance where appropriate.
-   Failure conditions and reasons for reduced or stopped production.

Production must not create output from missing inputs. Resource
deductions and output creation must be applied consistently and
atomically.

### 7.3 Labor and buildings

Buildings have capacity, input requirements, staffing, operating status,
and maintenance. Labor is finite and competes between agriculture,
extraction, industry, construction, transport, military service, and
other jobs.

The UI must explain why a building is idle or underperforming, such as
missing fuel, insufficient workers, blocked transport, or unavailable
machinery.

### 7.4 Trade and markets

Support contracts and exchanges between citizens, businesses, and
factions. Trade should account for:

-   Ownership and authorization.
-   Offered quantities and prices.
-   Available stock and reserved stock.
-   Payment and delivery conditions.
-   Travel duration and transport capacity.
-   Loss, theft, spoilage, interception, and failed delivery where
    supported.
-   Reputation, credit, and dispute resolution as later systems.

Distinguish a completed transaction from a trade agreement or an order
awaiting delivery.

Prices may initially be calculated from regional supply and demand.
Later, use explicit offers, bids, and executed trades. Never describe
fixed arbitrary prices as a fully dynamic market.

### 7.5 Logistics

Goods and units do not teleport. Routes have travel times and
capacities. Transport depends on terrain, roads, waterways, vehicles,
cargo, weather, and technology. Model local storage separately from
faction-wide totals so that goods in a distant warehouse cannot be used
instantly.

Start with regional routes and approximate travel costs. Add detailed
route planning only when the simpler model works.

### 7.6 Economic explanation

Players should be able to inspect resource balances and changes over
time. Show production, consumption, imports, exports, upkeep, losses,
and outstanding reservations separately. Explain shortages and major
changes in readable reports.

------------------------------------------------------------------------

## 8. Continuous Movement, Construction, and Warfare

### 8.1 Movement

Movement is a scheduled, time-dependent process. A journey should store
its origin, destination or route, departure time, expected arrival,
movement mode, cargo or unit, and status.

Travel duration depends on distance, terrain, roads, transport, weather,
load, and technology. Movement may be interrupted by obstacles, combat,
route changes, or other defined events.

Do not reveal exact positions to unauthorized observers. An observer may
know that an army passed through an area without knowing its current
location.

### 8.2 Construction

Construction requires valid ownership or permission, materials, labor,
tools, a suitable site, and elapsed work time. Construction may pause
when inputs or labor are unavailable. Progress must persist across
player disconnections and server restarts.

### 8.3 Military systems

Military capability must depend on more than unit count. Relevant
factors include equipment, training, morale, command, terrain, weather,
supply, fatigue, and strategic position.

Armies consume supplies and move through the same physical world as
other entities. War changes legal and diplomatic conditions, but should
not automatically reveal all enemy positions or plans.

### 8.4 Conflict and treaties

Define when declarations become effective, how parties are notified,
which actions are legal during peace and war, and how ceasefires and
peace treaties resolve. Avoid ambiguous states where both sides believe
incompatible treaty terms are active.

Combat must be server-resolved and reproducible from logged inputs and
random seeds where practical. Provide a battle report that explains
major contributing factors without exposing hidden enemy information
that participants have not legitimately learned.

------------------------------------------------------------------------

## 9. Information, Observation, and Rumors

Information is a simulation system, not merely a UI filter.

### 9.1 Information records

Represent meaningful knowledge as records with fields equivalent to:

-   Subject or event.
-   Information content and scope.
-   Source and recipient.
-   Time observed, time reported, and time received.
-   Location or geographic scope where relevant.
-   Confidence or reliability.
-   Whether the record is firsthand observation, a report, a rumor, or
    an official announcement.
-   Expiration or staleness rules if applicable.

Choose a data schema appropriate to the implementation; these fields
describe required concepts, not a mandate to use one specific database
structure.

### 9.2 Observation

An entity can observe only what its capabilities and circumstances
permit. Initial visibility may depend on distance, line of sight,
terrain, concealment, and observer capability. Later systems may include
scouts, sound, smoke, tracks, surveillance, and specialized instruments.

### 9.3 Communication

Information travels through defined channels, such as:

-   Direct observation.
-   Face-to-face conversation.
-   Messengers.
-   Traders and travelers.
-   Public notices.
-   Faction dispatches.
-   Diplomatic channels.
-   Spies and informants.
-   Later technologies such as telegraph or radio, if included in the
    chosen progression.

Communication has recipients, delay, reach, and possible interception or
distortion. A public announcement does not mean every character receives
it immediately.

### 9.4 Rumors and uncertainty

A rumor must not silently become certain truth. Preserve its source,
age, and reliability. Players may investigate or corroborate reports.
NPCs should make decisions based on what they know or reasonably
believe, not omniscient world state.

### 9.5 Security and tests

Server-side access control must ensure clients receive only authorized
information. Create tests that attempt to request hidden army locations,
secret buildings, private inventories, and diplomatic plans. A hidden
field must be absent from unauthorized responses, not merely omitted by
the UI.

------------------------------------------------------------------------

## 10. Technology and Player-Created Engineering

### 10.1 Technology progression

Technology should unlock materials, components, production methods,
measurement tools, and engineering capabilities. Avoid relying
exclusively on a generic research-point bar.

The intended historical or fictional progression must be decided before
detailed balancing. Until that decision is made, implement technology as
data-driven prerequisites and avoid hard-coding a complete era
progression.

Technology can spread through schematics, training, trade, migration,
espionage, education, and direct collaboration where the game rules
permit it.

### 10.2 Schematic builder

Provide a separate, usable design tool in which players assemble
permitted components and specify connections and parameters. Schematics
should be versioned, validated, inspectable, and reusable.

A schematic should describe data such as:

-   Component identifiers and quantities.
-   Connections and interfaces.
-   Dimensions and tolerances.
-   Material requirements.
-   Input energy and operating conditions.
-   Output behavior and intended use.
-   Performance parameters.
-   Known limitations and maintenance needs.
-   Required technologies and manufacturing capabilities.
-   Creator, version, licensing, and provenance.

### 10.3 Declarative, sandboxed designs

Never execute unrestricted player-uploaded scripts as part of the
authoritative simulation. Use a declarative format and a controlled
simulation engine.

Validation must reject invalid components, impossible connections,
negative costs, unsupported operations, malformed data, and values
outside permitted ranges. The engine determines performance from
validated parameters and implemented rules rather than trusting a
player's claimed output.

### 10.4 Engineering simulation stages

Implement in this order:

1.  A fixed component library with simple connection rules.
2.  A schematic editor and validator.
3.  Crafting and manufacturing costs.
4.  A small set of machines with deterministic input/output behavior.
5.  Mechanical power transmission and efficiency losses.
6.  Environmental power sources, including wind and water.
7.  More advanced components, materials, and performance trade-offs.
8.  Optional community publishing, licensing, reputation, and review
    tools.

### 10.5 Physical plausibility

Use approximate engineering equations where they create meaningful
gameplay. For example, idealized water power can use
`P = rho * g * Q * H * efficiency`, and idealized wind power can use
`P = 0.5 * rho * A * v^3 * power_coefficient`.

Document assumptions, units, conversion factors, and limits. Avoid
presenting approximate models as complete physical simulations. Ensure
that efficiency losses, material costs, and operating constraints
prevent perpetual-motion exploits or free production.

------------------------------------------------------------------------

## 11. User Interface and User Experience

The UI should be information-dense but readable, consistent, responsive,
and useful on mobile as well as desktop.

### 11.1 Main screens

1.  **World map:** terrain, known geography, borders, settlements,
    roads, rivers, selected region, and information overlays.
2.  **Civilization dashboard:** population, treasury, food, income,
    expenses, stability, technology, military upkeep, and warnings.
3.  **Settlement management:** buildings, queues, labor, storage,
    production status, construction, and local trade.
4.  **Citizen profile:** profession, inventory, property, contracts,
    current activity, known information, and travel.
5.  **Business management:** stock, production, workers, orders,
    contracts, transport, and financial history.
6.  **Diplomacy:** relations, treaties, known rival activity,
    negotiations, declarations, and public notices.
7.  **Military:** known unit positions, orders, supply, routes, battle
    reports, and available commands.
8.  **Engineering:** component library, schematic canvas, validation
    messages, manufacturing requirements, and design history.
9.  **Reports and history:** events, economic graphs, population trends,
    market records, travel logs, and world history.
10. **Communication:** messages, public announcements, rumors, faction
    communications, and delivery status.

Not every screen must be implemented in the first milestone. Establish
the information architecture early and add screens as their systems
become playable.

### 11.2 UI rules

-   Use a consistent design system for typography, spacing, colors,
    icons, panels, tables, tooltips, dialogs, and notifications.
-   Every displayed value must have a defined source and meaning.
-   Show why actions are disabled or invalid.
-   Distinguish estimates, confirmed facts, rumors, and stale
    information.
-   Show action status: pending, in progress, completed, interrupted,
    failed, or cancelled.
-   Provide confirmation for destructive or expensive actions.
-   Provide clear loading, empty, error, and offline states.
-   Use responsive layouts and accessible contrast, labels, focus
    states, and keyboard navigation.
-   Do not show information the player is not authorized to know.
-   Avoid decorative complexity that makes core information difficult to
    scan.

### 11.3 Information clarity

When production stops, explain the cause. When a shipment is delayed,
show the known reason. When a battle is lost, provide a report using the
information available to the participant. When an estimate is uncertain,
label it as an estimate.

------------------------------------------------------------------------

## 12. Persistence, Reliability, and Recovery

The world must survive reloads, browser closure, player disconnection,
and routine service restarts.

Required concepts:

-   Persistent authoritative state.
-   Database schema migrations.
-   Safe handling of partial failures.
-   Transactional resource transfers where possible.
-   Idempotent command handling.
-   Event and audit records for important actions.
-   Backups or snapshots and a documented recovery procedure.
-   Versioned saved data.
-   Detection and handling of invalid or inconsistent state.
-   Monitoring of simulation lag, failed jobs, and repeated events.

Do not rely on a browser tab or client timer to advance the world. A
player should not gain exclusive control over the world clock simply by
keeping a tab open.

If the chosen backend sleeps or has execution limits, design a reliable
mechanism for processing due events when the service wakes. Avoid
assuming a background process runs forever unless the hosting platform
actually guarantees it.

------------------------------------------------------------------------

## 13. Testing and Balance

Testing is a core implementation requirement, not a final polish phase.

### 13.1 Unit tests

Test individual rules, including:

-   Resource arithmetic and unit conversions.
-   Recipe inputs and outputs.
-   Movement-time calculations.
-   Construction prerequisites.
-   Permission checks.
-   Visibility decisions.
-   Schematic validation.
-   Water and wind power calculations.
-   Population and consumption updates.

### 13.2 Integration tests

Test complete workflows:

-   Two players join and act in the same world.
-   Two commands compete for limited stock.
-   A player disconnects during a journey and reconnects.
-   A construction project survives a service restart.
-   A merchant receives delayed information about a war.
-   A faction cannot read a rival's secret military orders.
-   A trade shipment is paid for and delivered exactly once.
-   A schematic is submitted, rejected or accepted, manufactured, and
    operated.
-   A river-powered machine produces less output when flow decreases.
-   A player without permission cannot issue a faction command.

### 13.3 Long-running simulations

Run automated simulations over many world days. Monitor:

-   Population, births, deaths, and migration.
-   Food production, consumption, and shortages.
-   Resource stocks and depletion.
-   Production capacity and idle time.
-   Market prices and trade volume.
-   Faction formation, stability, and collapse.
-   Military losses and supply failures.
-   Scheduled-event backlogs and processing time.

Look for runaway growth, resource duplication, deadlocks, endless event
loops, unbounded inventories, and economies that cannot recover from
ordinary shocks.

### 13.4 Balance philosophy

Prefer constraints that arise from the simulation to arbitrary
penalties. Make every important resource sink, growth limit, and
advantage understandable. Tune parameters using repeatable simulations
and actual playtests.

------------------------------------------------------------------------

## 14. AI-Friendly Repository and Documentation

The repository is the permanent project memory. Do not rely on the chat
transcript as the sole source of requirements.

Maintain these documents, adapting filenames if equivalent documents
already exist:

-   `AGENTS.md` --- concise instructions for coding agents, architecture
    boundaries, commands, testing, and handoff rules.
-   `GAME_DESIGN.md` --- product vision, design pillars, player roles,
    gameplay loops, exclusions, and unresolved decisions.
-   `ARCHITECTURE.md` --- system boundaries, state ownership, API
    contracts, trust model, and data flow.
-   `DATA_MODEL.md` --- entities, identifiers, fields, units,
    validation, relationships, and migration policy.
-   `IMPLEMENTATION_PLAN.md` --- milestones, dependencies, acceptance
    criteria, and task status.
-   `CURRENT_STATE.md` --- current working state, verified features,
    known defects, and the next task.
-   `CHANGELOG.md` --- meaningful changes and behavior changes.
-   `docs/ui/` --- screen specifications, interaction patterns,
    component rules, and design tokens.
-   `docs/systems/` --- separate specifications for the clock,
    population, economy, trade, logistics, diplomacy, warfare,
    information, environment, and engineering.
-   `tests/` --- automated tests and repeatable simulation scenarios.

Keep top-level agent instructions concise. Put detailed system rules in
their own documents so each task can load only what it needs.

### 14.1 Task format

Each implementation task should state:

-   **Goal:** one clear result.
-   **Relevant files:** likely code and documentation locations.
-   **Dependencies:** prior systems or decisions required.
-   **Behavior:** explicit rules and edge cases.
-   **Acceptance criteria:** observable conditions that must pass.
-   **Tests:** tests to add or run.
-   **Out of scope:** changes that must not be included.

### 14.2 Handoff format

At the end of every session, update `CURRENT_STATE.md` with:

-   What changed.
-   Files changed.
-   Tests and commands run, with actual outcomes.
-   Known defects and unresolved questions.
-   Any migrations or configuration changes.
-   The next recommended task, including its acceptance criteria.

Do not leave vague instructions such as "continue development." Leave
one concrete, bounded task.

------------------------------------------------------------------------

## 15. Implementation Roadmap

Every milestone must leave the repository in a working, recoverable
state. Do not begin later phases merely because the earlier code exists;
confirm the acceptance criteria first.

### Milestone 0 --- Repository and technical foundation

-   Inspect the repository and existing constraints.
-   Select the frontend, backend, persistence, and deployment approach.
-   Record hosting quotas, required secrets, and setup steps.
-   Create or update the core documentation.
-   Establish formatting, testing, build, and migration workflows.

**Acceptance:** a fresh developer or AI agent can follow the
instructions, run the project, and understand the architecture.

### Milestone 1 --- Shared persistent world

-   Implement player identity and permissions.
-   Create a world and join multiple players to it.
-   Persist authoritative state.
-   Submit and validate basic commands.
-   Render the same shared world from multiple clients.

**Acceptance:** two separate clients can see consistent shared state;
unauthorized changes are rejected; reloads do not erase the world.

### Milestone 2 --- Clock, events, and movement

-   Implement authoritative world time.
-   Implement scheduled events and idempotent command handling.
-   Add locations, routes, and time-dependent travel.
-   Add persistence and recovery for in-progress journeys.

**Acceptance:** actions can be issued at any time, journeys take time,
and travel survives disconnects and restarts.

### Milestone 3 --- Citizens and economic loop

-   Add player citizens, factions, NPC cohorts, food, labor, resources,
    and production.
-   Add buildings, construction queues, inventories, and basic markets.
-   Add explanations for production and consumption.

**Acceptance:** a small settlement can produce, consume, trade,
experience shortages, and recover through player decisions.

### Milestone 4 --- Geography and logistics

-   Add terrain, elevation, rivers, resources, settlements, and routes.
-   Make geography affect movement, production, and settlement value.
-   Add cargo and regional storage.

**Acceptance:** different locations have meaningful advantages, and
goods cannot be used remotely without transport rules.

### Milestone 5 --- Information asymmetry

-   Add observation and knowledge records.
-   Add hidden buildings, inventories, and military positions.
-   Add delayed communication and rumors.
-   Enforce visibility filtering in the backend.

**Acceptance:** two players in the same world can legitimately possess
different knowledge, and hidden state cannot be extracted through
unauthorized requests.

### Milestone 6 --- Diplomacy and warfare

-   Add treaties, faction relations, declarations, armies, equipment,
    supplies, and battles.
-   Integrate military actions with movement and logistics.
-   Add reports and history.

**Acceptance:** a war affects the world without revealing all hidden
information, and military outcomes depend on resources, time, and
position.

### Milestone 7 --- Environmental engineering

-   Add regional wind and water flow.
-   Add a fixed set of components and machine behaviors.
-   Add the schematic editor, validation, manufacturing, and operation.
-   Add mechanical power conversion and efficiency losses.

**Acceptance:** a valid machine can be designed, manufactured, and
operated; invalid designs are rejected; environmental conditions affect
output.

### Milestone 8 --- Depth and polish

-   Expand technology and component libraries.
-   Improve NPC decision-making and markets.
-   Add further professions, public institutions, disasters, and
    historical reports.
-   Tune balance and interface quality using test data.

**Acceptance:** the simulation can run for long periods without critical
exploits, persistent inconsistencies, or unmanageable performance.

The order may be adjusted based on technical dependencies, but changes
must be documented. Do not build advanced features on untested
foundations.

------------------------------------------------------------------------

## 16. Definition of Done

A feature is not done merely because its interface exists.

A feature is complete only when:

1.  Its behavior is specified.
2.  Its authoritative rules are implemented in the correct layer.
3.  Its permissions and edge cases are handled.
4.  Its UI represents actual state and provides understandable feedback.
5.  Its data persists correctly.
6.  Automated tests cover core behavior and important failures.
7.  Relevant regression tests pass.
8.  Its documentation reflects the implementation.
9.  Known limitations are recorded.
10. The project remains runnable and recoverable.

If a feature cannot be fully completed within one session, implement a
coherent smaller slice, document the remaining work, and do not present
the unfinished feature as complete.

------------------------------------------------------------------------

## 17. Unresolved Product Decisions

Do not silently make major design choices. Record decisions and their
consequences in `GAME_DESIGN.md`. Use reasonable temporary defaults only
when needed to build an isolated prototype.

The following decisions require explicit resolution before detailed
balancing:

1.  **Historical scope:** historically grounded progression, fictional
    progression, or an open-ended technological sandbox.
2.  **World scale:** map size, number of active players, expected NPC
    population, and number of simultaneous machines.
3.  **Time scale:** real-time-to-world-time conversion, travel speeds,
    construction duration, and seasonal length.
4.  **World structure:** single shared world, multiple worlds, or
    separate scenarios.
5.  **Faction rules:** creation limits, leadership succession,
    membership, leaving, taxes, and territorial claims.
6.  **Economy:** currency model, market structure, property rules, and
    whether NPC businesses trade autonomously.
7.  **Engineering scope:** component-based machines only, a more
    flexible schematic editor, or eventual advanced mechanical networks.
8.  **Communication technology:** how information travels at each stage
    of technological development.
9.  **Backend and hosting:** provider, database, deployment process,
    quotas, and cost ceiling.
10. **Moderation and governance:** naming rules, schematic review,
    griefing, abuse reports, and server administration.

Do not block all progress while every decision remains open. Build
foundations that remain useful under several plausible answers, and
isolate assumptions in configuration or data rather than scattering them
through code.

------------------------------------------------------------------------

## 18. First Task for the Coding AI

**Do not immediately implement the full game.**

First inspect the repository and report:

1.  Existing files, frameworks, architecture, and working functionality.
2.  Current test/build status.
3.  Whether the current architecture supports persistent shared
    multiplayer.
4.  Missing technical prerequisites and likely hosting constraints.
5.  Conflicts between existing code and this specification.
6.  The smallest viable implementation plan with dependencies and
    acceptance criteria.
7.  The first bounded implementation task.

Then create or update the documentation and begin Milestone 0. Do not
delete or rewrite existing code without a reasoned migration plan.

**Final principle:** build a small, persistent, secure, understandable
simulation first. Expand its depth only when the existing systems are
verified. The goal is not to produce the largest amount of code; it is
to produce a world whose rules remain coherent as more players, systems,
and AI coding sessions are added.
