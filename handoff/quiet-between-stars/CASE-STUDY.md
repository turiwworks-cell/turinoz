# Quiet Between Stars

Ambient motion system · Petie Clark · 2025–26

## A place to stay awhile.

Quiet Between Stars is a space for thinking clearly. I designed the world,
its motion, and the system that keeps it alive.

| State | Duration |
| --- | --- |
| Primary Idle | 180 seconds |
| Entry | 5 seconds |
| Hyperspace | 170 seconds |
| Return | 5 seconds |

Master canvas: 6480 × 3840 · 24 fps · Silent

## A space, rather than a scene.

Petie wanted his office to feel like the inside of a ship: somewhere to work
quietly, think clearly, and feel removed from urgency. The future installation
was three large vertical OLED displays, with ultrawide versions for his desk.

The work had to stay easy to live with for hours. Deep black, distant structure,
and motion slow enough to forget it was there. That became the rule for
everything that followed.

## Still water. A smooth current.

Idle supports focus. Hyperspace carries a little more momentum. The feeling
changes; the world stays connected.

- **Stay.** Sparse stars, a little atmosphere, and depth that shifts slowly.
  Nothing asks to be watched. Primary Idle loops for 180 seconds.
- **Begin to move.** The field gathers and stretches into the tunnel. A
  controlled change of state, in five seconds.
- **Find the flow.** A sustained cloud tunnel. More movement, with the same
  restraint. This is the long part of the journey: 170 seconds.
- **Ease back.** The tunnel gives way to the star field it came from. The same
  seed carries through entry, cruise, and return. Five seconds back to Idle.

Entry, Cruise and Return form one 180-second hyperspace package. In the web
page, Entry continues into Hyperspace; Return continues into Idle.

## Give the black more room.

The early pass had the pacing. The clouds needed to step back. I reduced their
presence and left more of the frame open. A02 became our visual baseline.

The page compares A01 with the chosen A02 darker styleframe. B01 and C01 show
other arrangements within the same visual world.

## A world you can keep changing.

The deliverable was an After Effects system as well as a set of films. A master
seed reshapes the scene, while each part keeps its own controls.

The system combines 120 hero stars and 400 micro stars, a loop-safe 180-second
master timeline, and a master seed range of 0–99,000. Each star has its own
position in 3D space. Near and far distances, size, opacity and density shape
the field. Parallax comes from that depth.

### Keep the part you liked.

Each local seed is added to the master. A global change can reshape the world;
an offset can bring one favourite layer back.

```text
Master              900
Local offset       −895
Resulting seed        5

Math.round(master + local)
```

The interactive system section presents real development screenshots and
controller-guide pages for depth, motion, variation and control.

## Drifting forward. Less going around.

Petie’s first review caught a swirl in the idle. I separated X and Y drift,
gave Z movement the lead, and replaced the atmosphere’s looping offset with
evolution.

The change is quiet. Both excerpts show the same 25 seconds at normal speed;
the aim was a steadier sense of direction, while keeping the scene alive.

### Easy to change. Reasonable to render.

I kept refining the build after the look was working. In my production tests,
a full render went from around 7½ hours to 40–50 minutes. Petie later reported
about 25 minutes for his full package.

Times reported during production on different machines; they are observations,
not a controlled benchmark.

## One space. Room for every screen.

The master spans three vertical 4K displays. Dedicated compositions handle
the single portrait and two ultrawide formats, with their own framing controls.

| Format | Dimensions |
| --- | --- |
| Triplewide | 6480 × 3840 |
| Portrait | 2160 × 3840 |
| Ultrawide | 5120 × 1440 |
| Ultrawide | 3840 × 1600 |

The page uses stills from the four delivered v01 idle exports. Display divisions
show the intended layout.

## Handed over. Open to what’s next.

The renders, the editable system, and a guide to using it. Petie went on to
build his own web control layer around the project for quick changes and RAM
previews.

- **Motion:** Primary Idle · Entry · Hyperspace · Return
- **Master:** 6480 × 3840 · 24 fps · Silent
- **Idle formats:** Triplewide · Portrait · Two ultrawides
- **Source:** Procedural After Effects project
- **Handoff:** Controller guide · Workspace setup · Export guidance

> “Your guide was great and I felt right at home in the project.”
>
> Petie Clark · Client · February 2026

Creative direction, design & motion: **Turinoz**  
Client: **Petie Clark**  
Delivery partner: **OSL Wire**  
Built in: **Adobe After Effects**

---

Editorial companion to the [implemented case study](../../turinoz-portfolio/quiet-between-stars/).
For source attribution and research limits, see the
[full research report](Quiet-Between-Stars-Research-Report.md).
