"use client";

import {
  rateArtisan,
  requestRework,
  submitTrendingPhoto,
} from "@/app/actions/after-receive";

export default function ClientAfterReceive({
  projectId,
  rating,
  review,
  trendingPath,
}: {
  projectId: string;
  rating: number | null;
  review: string | null;
  trendingPath: string | null;
}) {
  return (
    <section className="border border-stone rounded-2xl p-6 mb-6 space-y-8">
      <div>
        <h2 className="font-display text-lg mb-2">Rate your artisan</h2>
        {rating ? (
          <p className="text-sm text-ink/70">
            You rated {rating}/5{review ? `. ${review}` : ""}
          </p>
        ) : (
          <form action={rateArtisan} className="space-y-3">
            <input type="hidden" name="projectId" value={projectId} />
            <select
              name="rating"
              required
              className="border border-stone rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Stars</option>
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
            <textarea
              name="review"
              rows={3}
              placeholder="Optional review"
              className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="text-sm bg-royal text-paper rounded-full px-4 py-2"
            >
              Save rating
            </button>
          </form>
        )}
        <p className="text-[11px] text-ink/40 mt-2">
          Lifestyle points for reviews come later.
        </p>
      </div>

      <div>
        <h2 className="font-display text-lg mb-2">Trending styles photo</h2>
        <p className="text-sm text-ink/55 mb-3">
          Optional. A well photographed finished piece for Hope to approve for
          Trending styles.
        </p>
        {trendingPath ? (
          <p className="text-sm text-ink/70">Photo submitted. Waiting on approval.</p>
        ) : (
          <form action={submitTrendingPhoto} className="space-y-3">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="file" name="photo" accept="image/*" required />
            <button
              type="submit"
              className="block text-sm border border-royal text-royal rounded-full px-4 py-2"
            >
              Submit photo
            </button>
          </form>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg mb-2">More detailing</h2>
        <p className="text-sm text-ink/55 mb-3">
          Not satisfied and sending fabric back? This reopens production (step
          7). You can add two weeks to the date or keep it.
        </p>
        <form action={requestRework} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <textarea
            name="note"
            rows={2}
            placeholder="What needs more work"
            className="w-full border border-stone rounded-lg px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="extend" value="yes" />
            Add two weeks to the deadline
          </label>
          <button
            type="submit"
            className="text-sm border border-ink/20 rounded-full px-4 py-2"
          >
            Request more detailing
          </button>
        </form>
      </div>
    </section>
  );
}
