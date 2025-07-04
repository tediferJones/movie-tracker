'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { useEffect, useRef, useState } from 'react';
import { reviews } from '@/drizzle/schema';
import { useUser } from '@clerk/nextjs';
import { Eye, X } from 'lucide-react';
import Loading from '@/components/subcomponents/loading';
import ReviewsDisplay from '@/components/subcomponents/reviewsDisplay';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import StarRating from '@/components/subcomponents/StarRating';
import { inputValidation } from '@/lib/inputValidation';
import easyFetch from '@/lib/easyFetch';
import { ratingConfig, watchAgainConfig } from '@/lib/reviewHelpers';

type ExistingReview = typeof reviews.$inferSelect
export type ReviewBody = {
  review: string | null,
  rating: number | null,
  watchAgain: boolean | null,
}

export default function ReviewManager({ imdbId }: { imdbId: string }) {
  const [currentReview, setCurrentReview] = useState<ReviewBody>();
  const [existingReview, setExistingReview] = useState<ExistingReview>();
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState('Waiting...');
  const [modalVisibile, setModalVisible] = useState(false);
  const [changeRating, setChangeRating] = useState(false);
  const ratingContainer = useRef<HTMLDivElement>(null);

  const reviewMismatch = (
    JSON.stringify(existingReview) !== JSON.stringify(currentReview)
  )
  const { starCount, maxRating, minRating, starValue } = ratingConfig;
  const defaultReview: ReviewBody = {
    review: null,
    rating: null,
    watchAgain: null,
  }

  // FIX ME
  // Think more about how to display null ratings, right now we just turn down the opacity
  //  - might be worth removing null as a rating value, just use 0 by default, then a minimum review can be 0.05 stars
  // This entire component could use some cleanup/refactoring
  //  - The main div should also be a form
  //  - Handle the difference between POST and PUT more clearly
  //    - maybe create an object with the different values for POST and PUT
  //    - maybe even make a state variable just to handle weather we're using POST or PUT

  function getRating(position: number, width: number) {
    width = width - 4; // provide a small buffer so its easier to set 0 or 100
    const rating = Math.round(position / width * 100);
    if (rating < 0) return 0;
    if (rating > maxRating) return maxRating;
    return rating;
  }

  function handleRatingChange(cursorPos: number, force?: boolean) {
    if (!currentReview) return;
    if (!ratingContainer.current) return;
    if (!force && !changeRating) return;
    const rect = ratingContainer.current.getBoundingClientRect();
    const position = cursorPos - rect.left;
    const rating = getRating(position, rect.width);
    setCurrentReview({ ...currentReview, rating });
  }

  const { user } = useUser();
  useEffect(() => {
    if (user?.username) {
      easyFetch<ExistingReview | undefined>({
        route: `/api/users/${user.username}/reviews`,
        method: 'GET',
        params: { imdbId },
      }).then(data => {
          setCurrentReview(data || defaultReview);
          setExistingReview(data);
          setButtonText(data ? 'Update Review' : 'Submit Review');
        });
    }
  }, [refreshTrigger, user?.username]);

  return !currentReview ? <Loading /> :
    <>
      <div className='flex flex-col gap-4 p-4 showOutline'>
        <div className='flex justify-between'>
          <h1 className='text-xl my-auto'>My Review</h1>
          {existingReview &&
            <Button variant='destructive'
              onClick={() => setModalVisible(true)}
            >Delete My Review</Button>
          }
        </div>

        <div className='flex flex-wrap justify-around'>
          <div className='flex flex-wrap justify-around items-center gap-4 p-2'>
            <span>Watch Again?</span>
            <div className='flex gap-4'>
              {Object.values(watchAgainConfig).map(watchAgainType => {
                const {
                  className,
                  activeClassName,
                  value,
                  description
                } = watchAgainType;
                return (
                  <Button className={`transition-colors duration-300 ${currentReview.watchAgain === value ? activeClassName : className}`}
                    key={`userRating-${watchAgainType.description}`}
                    variant='outline'
                    title={description}
                    onClick={() => setCurrentReview({
                      ...currentReview,
                      watchAgain: watchAgainType.value
                    })}
                  >
                    <Eye />
                  </Button>
                )
              })}
            </div>
          </div>

          <div className='flex flex-wrap justify-around items-center gap-4 p-2'>
            <label className='my-auto' htmlFor='myRating'>Rating:</label>
            <Input className='p-2 showOutline w-min'
              name='myRating'
              id='myRating'
              value={((currentReview.rating || 0) / starValue).toFixed(2)} 
              onChange={e => setCurrentReview({ 
                ...currentReview,
                rating: Number(e.target.value) * starValue,
              })} 
              type='number'
              min={minRating}
              max={starCount}
              step={starCount / maxRating} 
            />

            <div className='flex justify-center items-center gap-4'>
              <StarRating 
                className='touch-none cursor-pointer'
                keyPrefix='userRating'
                rating={currentReview.rating}
                ref={ratingContainer}
                onMouseDown={() => setChangeRating(true)}
                onMouseUp={() => setChangeRating(false)}
                onMouseLeave={() => setChangeRating(false)}
                onMouseMove={(e) => handleRatingChange(e.clientX)}
                onTouchStart={() => setChangeRating(true)}
                onTouchEnd={() => setChangeRating(false)}
                onTouchMove={(e) => handleRatingChange(e.touches[0].clientX)}
                onClick={(e) => handleRatingChange(e.clientX, true)}
              />
              <Button variant='outline'
                className={`transition-opacity duration-300 ${currentReview.rating !== null ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setCurrentReview({
                  ...currentReview,
                  rating: null
                })}
              >
                <X />
              </Button>
            </div>
          </div>
        </div>

        <Textarea name='myReview' 
          value={currentReview.review || ''} 
          onChange={(e) => setCurrentReview({ 
            ...currentReview, 
            review: e.target.value 
          })}
          rows={4}
          placeholder='Write Your Review Here'
          {...inputValidation.review}
        />

        <Button
          disabled={!reviewMismatch}
          onClick={() => {
            if (user?.username) {
              setButtonText(existingReview ? 'Updating Review...' : 'Adding Review...');
              easyFetch({
                route: `/api/users/${user.username}/reviews`,
                method: existingReview?.username ? 'PUT' : 'POST',
                params: { imdbId },
                body: currentReview,
                skipJSON: true,
              }).then(() => setRefreshTrigger(!refreshTrigger));
            }
          }}
        >{buttonText}</Button>
      </div>
      <ConfirmModal
        visible={modalVisibile}
        setVisible={setModalVisible}
        action={() => {
          if (user?.username) {
            setButtonText('Deleting Review...');
            easyFetch({
              route: `/api/users/${user.username}/reviews`,
              method: 'DELETE',
              params: { imdbId },
              skipJSON: true,
            }).then(() => setRefreshTrigger(!refreshTrigger));
          }
        }}
      >
        <p>Are you sure you want to delete this review?</p>
      </ConfirmModal>
      <ReviewsDisplay imdbId={imdbId} extTrigger={refreshTrigger} />
    </>
}
