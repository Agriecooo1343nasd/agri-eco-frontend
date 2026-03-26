import sys

with open("c:/Developer/agri-eco/agri-eco/src/app/education/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace Imports
import_old = """import {
  trainingPrograms,
  learningResources,
  quizzes,
  schoolVisitConfig,
} from "@/data/education";"""
import_new = """import {
  learningResources,
  quizzes,
  schoolVisitConfig,
} from "@/data/education";
import { fetchTrainingPrograms } from "@/lib/api/education";"""
code = code.replace(import_old, import_new)

# Replace 'typeof trainingPrograms[0]' to 'any' in definitions
type_old_1 = """(typeof trainingPrograms)[0] | null"""
type_new_1 = """any | null"""
code = code.replace(type_old_1, type_new_1)

type_old_2 = """(program: (typeof trainingPrograms)[0])"""
type_new_2 = """(program: any)"""
code = code.replace(type_old_2, type_new_2)

# Insert State & Effect
hook_old = """  const [trainingSearch, setTrainingSearch] = useState(searchParam);"""
hook_new = """  const [trainingSearch, setTrainingSearch] = useState(searchParam);
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageParam);

  useEffect(() => {
    let ignore = false;
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const res = await fetchTrainingPrograms({
          search: trainingSearch || undefined,
          limit: 100
        });
        if (!ignore) {
          const mapped = res.data.map(p => {
            const enrolled = 0;
            let status = "open";
            if (p.startDate && new Date(p.startDate) > new Date()) status = "upcoming";
            if (p.endDate && new Date(p.endDate) < new Date()) status = "completed";
            if (enrolled >= p.capacity) status = "full";

            return {
              id: p.id,
              title: p.title,
              description: p.shortDescription || p.fullDescription,
              image: p.coverImage || p.heroImage || "/assets/tours/educational.jpg",
              type: p.type,
              level: { en: p.level },
              status,
              duration: { en: `${p.durationWeeks} Weeks` },
              startDate: { en: p.startDate ? new Date(p.startDate).toLocaleDateString() : "TBD" },
              enrolled,
              maxParticipants: p.capacity,
              topics: p.topics.map(t => ({ en: t.name?.en || "" })),
              price: p.priceRwf,
              certificate: p.type === "certification"
            };
          });
          setTrainingPrograms(mapped);
          setCurrentPage(1); // Reset page on new fetch
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchPrograms();
    return () => { ignore = true; };
  }, [trainingSearch]);"""
code = code.replace(hook_old, hook_new)

# Adjust 'updateParam' and select inputs
status_search_old = """                    onChange={(e) => {
                      setTrainingStatus(e.target.value);
                      updateParam("status", e.target.value);
                    }}"""
status_search_new = """                    onChange={(e) => {
                      setTrainingStatus(e.target.value);
                      updateParam("status", e.target.value);
                      setCurrentPage(1);
                      updateParam("page", "1");
                    }}"""
code = code.replace(status_search_old, status_search_new)

# Replace the grid render mapping
grid_old = """                <div className="grid md:grid-cols-2 gap-6">
                  {trainingPrograms
                    .filter(
                      (p) =>
                        (!trainingSearch ||
                          p.title.en
                            .toLowerCase()
                            .includes(trainingSearch.toLowerCase()) ||
                          p.description.en
                            .toLowerCase()
                            .includes(trainingSearch.toLowerCase())) &&
                        (trainingStatus === "all" ||
                          p.status === trainingStatus),
                    )
                    .map((p) => ("""

grid_new = """                {loading && <div className="text-center py-10 text-muted-foreground text-sm font-semibold">Loading programs...</div>}
                
                {!loading && (
                <>
                <div className="grid md:grid-cols-2 gap-6">
                  {(() => {
                    const filtered = trainingPrograms.filter(p => trainingStatus === "all" || p.status === trainingStatus);
                    if (filtered.length === 0) return <div className="col-span-2 text-center py-8 text-muted-foreground">No programs found.</div>;
                    const itemsPerPage = 4;
                    const totalPages = Math.ceil(filtered.length / itemsPerPage);
                    const safePage = Math.min(currentPage, Math.max(1, totalPages));
                    const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);
                    return paginated.map((p) => ("""
code = code.replace(grid_old, grid_new)

end_grid_old = """                    ))}
                </div>
              </TabsContent>"""
              
end_grid_new = """                    ));
                  })()}
                </div>
                {(() => {
                  const filtered = trainingPrograms.filter(p => trainingStatus === "all" || p.status === trainingStatus);
                  const itemsPerPage = 4;
                  const totalPages = Math.ceil(filtered.length / itemsPerPage);
                  if (totalPages > 1) {
                    return (
                      <div className="flex justify-center gap-2 mt-8">
                        <Button 
                          variant="outline" 
                          disabled={currentPage <= 1}
                          onClick={() => {
                            setCurrentPage(p => p - 1);
                            updateParam("page", String(currentPage - 1));
                          }}
                        >
                          Previous
                        </Button>
                        <span className="flex items-center text-sm text-foreground font-semibold">
                          Page {Math.min(currentPage, totalPages)} of {totalPages}
                        </span>
                        <Button 
                          variant="outline" 
                          disabled={currentPage >= totalPages}
                          onClick={() => {
                            setCurrentPage(p => p + 1);
                            updateParam("page", String(currentPage + 1));
                          }}
                        >
                          Next
                        </Button>
                      </div>
                    );
                  }
                  return null;
                })()}
                </>
                )}
              </TabsContent>"""
code = code.replace(end_grid_old, end_grid_new)

with open("c:/Developer/agri-eco/agri-eco/src/app/education/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)
