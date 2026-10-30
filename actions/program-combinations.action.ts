"use server";
import { replaceProgramCombinations } from "@/services/program-combinations.service";
import { revalidatePath } from "next/cache";

export async function saveProgramCombinationsAction(program: string, year: number, combinations: string[]) {
  await replaceProgramCombinations(program, year, combinations);
  for (const path of ["/admin/quan-ly-ctdt", "/admin/to-hop-mon", "/nop-ho-so", "/tra-cuu-nganh"])
    revalidatePath(path);
}
