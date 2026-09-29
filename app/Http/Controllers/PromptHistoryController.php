<?php

namespace App\Http\Controllers;

use App\Http\Resources\PromptGenerationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * The signed-in user's saved prompt generations
 *
 * Every query goes through the user's own relation, so one user can never
 * read or delete another user's generations (they get a 404 instead).
 */
class PromptHistoryController extends Controller
{
    /**
     * List generations, newest first
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $generations = $request->user()
            ->promptGenerations()
            ->latest()
            ->latest('id')
            ->paginate(12);

        return PromptGenerationResource::collection($generations);
    }

    /**
     * Show one generation including the full result
     */
    public function show(Request $request, int $id): PromptGenerationResource
    {
        return new PromptGenerationResource(
            $request->user()->promptGenerations()->findOrFail($id)
        );
    }

    /**
     * Delete one generation
     */
    public function destroy(Request $request, int $id): Response
    {
        $request->user()->promptGenerations()->findOrFail($id)->delete();

        return response()->noContent();
    }
}
