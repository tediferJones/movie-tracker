'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { useEffect, useRef, useState } from 'react';
import { Eye, Star, X } from 'lucide-react';
import Loading from '@/components/subcomponents/loading';
import ReviewsDisplay from '@/components/subcomponents/reviewsDisplay';
import ConfirmModal from '@/components/subcomponents/confirmModal';
import { inputValidation } from '@/lib/inputValidation';
import { useUser } from '@clerk/nextjs';
import { reviews } from '@/drizzle/schema';
import easyFetch from '@/lib/easyFetch';

type ExistingReview = typeof reviews.$inferSelect
type EmptyReview = {
  review: string | null,
  rating: number | null,
  watchAgain: boolean | null,
  username: undefined,
}

export default function ReviewManager({ imdbId }: { imdbId: string }) {
  const [existingReview, setExistingReview] = useState<ExistingReview | EmptyReview>();
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);
  // const [lockRating, setLockRating] = useState<boolean>(false);
  // const [isHovering, setIsHovering] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState('Waiting...');
  const [modalVisibile, setModalVisible] = useState(false);
  const [changeRating, setChangeRating] = useState(false);
  const ratingContainer = useRef<HTMLDivElement>(null);

  const defaultReview = {
    review: null,
    rating: null,
    watchAgain: null,
    username: undefined
  }

  // FIX ME
  // consolidate shared values between this component and reviewsDisplay since many of these are shared
  // Update button should be disabled unless review has actually changed
  //  - will probably need two state values for review, one for the existingReview and another for the edited review's state
  //  - this should also apply to new reviews, no point in posting an entirely empty review
  // Think more about how to display null ratings, right now we just turn down the opacity
  //  - might be worth removing null as a rating value, just use 0 by default, then a minimum review can be 0.05 stars
  const starCount = 5;
  const starValue = 20;
  const maxRating = 100;
  const stars = getStars(existingReview?.rating || 0)
  function getStars(rating: number) {
    return Array.from({ length: starCount }, () => {
      let fillPercent = 0;
      if (rating >= starValue) {
        fillPercent = 100;
      }
      if (0 < rating && rating < starValue) {
        fillPercent = Math.round(rating / starValue * 100);
      }
      rating -= starValue;
      return fillPercent;
    });
  }

  function getRating(position: number, width: number) {
    width = width - 4; // provide a small buffer so its easier to set 0 or 100
    const rating = Math.round(position / width * 100);
    if (rating < 0) return 0;
    if (rating > maxRating) return maxRating;
    return rating;
  }

  function handleRatingChange(cursorPos: number, force?: boolean) {
    if (!existingReview) return;
    if (!ratingContainer.current) return;
    if (!force && !changeRating) return;
    const rect = ratingContainer.current.getBoundingClientRect();
    const position = cursorPos - rect.left;
    const rating = getRating(position, rect.width);
    setExistingReview({ ...existingReview, rating });
  }

  const { user } = useUser();
  useEffect(() => {
    if (user?.username) {
      easyFetch<ExistingReview | undefined>({
        route: `/api/users/${user.username}/reviews`,
        method: 'GET',
        params: { imdbId },
      }).then(data => {
          setExistingReview(data || defaultReview);
          setButtonText(data ? 'Update Review' : 'Submit Review');
        });
    }
  }, [refreshTrigger, user?.username]);

  return !existingReview ? <Loading /> :
    <>
      <div className='flex flex-col gap-4 p-4 showOutline'>
        <div className='flex justify-between'>
          <h1 className='text-xl my-auto'>My Review</h1>
          {!existingReview.username ? [] : 
            <Button variant='destructive'
              onClick={() => setModalVisible(true)}
            >Delete My Review</Button>
          }
        </div>

        <div className='flex sm:flex-row flex-col items-center gap-4'>
          <div className='flex-1'>Watch Again?</div>
          <div className='flex-1 flex flex-wrap gap-4'>
            <Button variant='secondary'
              className={`flex-1 ${existingReview.watchAgain === true ? 'bg-green-600 hover:bg-green-500' : ''}`}
              onClick={() => setExistingReview({
                ...existingReview,
                watchAgain: [null, false].includes(existingReview.watchAgain) ? true : null,
              })}
            >Watch Again</Button>
            <Button variant='secondary'
              className={`flex-1 ${existingReview.watchAgain === false ? 'bg-red-600 hover:bg-red-500' : ''}`}
              onClick={() => setExistingReview({
                ...existingReview,
                watchAgain: [null, true].includes(existingReview.watchAgain) ? false : null,
              })}
            >Not Worth It</Button>
            {/*
            <Button className={`transition-colors duration-300 ${existingReview.watchAgain === true ? 'bg-green-500 hover:bg-green-600' : '!text-green-500'}`} 
              variant='outline'
              onClick={() => setExistingReview({
                ...existingReview,
                watchAgain: existingReview.watchAgain === true ? null : true,
              })}
            >
              <Eye />
            </Button>
            <Button className='text-muted-foreground' 
              variant='outline'
              onClick={() => setExistingReview({
                ...existingReview,
                watchAgain: null,
              })}
            >
              <Eye />
            </Button>
            <Button variant='outline'>
              <Eye className='text-red-500' />
            </Button>
            */}
          </div>
        </div>

        <div className='flex flex-wrap justify-between items-center gap-4'>
          <label className='my-auto'
            htmlFor='myRating'
          >Rating: </label>
          <Input className='p-2 showOutline w-min'
            name='myRating'
            id='myRating'
            value={((existingReview.rating || 0) / starValue).toFixed(2)} 
            onChange={e => setExistingReview({ 
              ...existingReview,
              rating: Number(e.target.value) * starValue,
            })} 
            type='number' min={0} max={starCount} step={starCount / maxRating} 
          />

          <div className='relative touch-none'
            ref={ratingContainer}
            title={existingReview.rating !== null ? `Rating: ${existingReview.rating / starValue} / ${starCount}` : 'No Rating'}
            onMouseDown={() => setChangeRating(true)}
            onMouseUp={() => setChangeRating(false)}
            onMouseLeave={() => setChangeRating(false)}
            onMouseMove={(e) => handleRatingChange(e.clientX)}
            onTouchStart={() => setChangeRating(true)}
            onTouchEnd={() => setChangeRating(false)}
            onTouchMove={(e) => handleRatingChange(e.touches[0].clientX)}
            onClick={(e) => handleRatingChange(e.clientX, true)}
          >
            <div className='flex'>
              {Array(starCount).fill(0).map((_, i) => (
                <Star key={`empty-star-${i}`} className='text-muted-foreground' />
              ))}
            </div>
            <div className='flex absolute top-0 left-0'>
              {Array(starCount).fill(0).map((_, i) => (
                <div className='w-6 h-6'>
                  <div className='overflow-clip' style={{ width: `${stars[i]}%` }}>
                    <Star key={`filled-star-${i}`} className='text-yellow-500 fill-yellow-500' />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button variant='outline'
            onClick={() => setExistingReview({
              ...existingReview,
              rating: null
            })}
          >
            <X />
          </Button>

          {/*
          <div className='flex-1 min-h-[2em] min-w-[8em] relative showOutline overflow-hidden'
            onMouseMove={e => {
              if (lockRating && existingReview) {
                setExistingReview({ 
                  ...existingReview, 
                  rating: Math.round(e.nativeEvent.offsetX / e.currentTarget.offsetWidth * 100),
                })
              }
            }} 
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setLockRating(false);
              setIsHovering(false);
            }}
            onClick={() => setLockRating(!lockRating)}
          >
            {!lockRating && !isHovering ? [] : 
              <div className='absolute w-full h-full flex justify-center items-center'
              >Click to {lockRating ? 'Set' : 'Edit'}</div>
            }
            <div className='h-full bg-yellow-500'
              style={{
                width: `${existingReview.rating || 0}%`, 
                pointerEvents: 'none'
              }}
            ></div>
          </div>
          */}
        </div>

        <Textarea name='myReview' 
          value={existingReview.review || ''} 
          onChange={(e) => setExistingReview({ 
            ...existingReview, 
            review: e.target.value 
          })}
          rows={4}
          placeholder='Write Your Review Here'
          {...inputValidation.review}
        />

        <Button onClick={() => {
          if (user?.username) {
            setButtonText(existingReview.username ? 'Updating Review...' : 'Adding Review...');
            easyFetch({
              route: `/api/users/${user.username}/reviews`,
              method: existingReview.username ? 'PUT' : 'POST',
              params: { imdbId },
              body: existingReview,
              skipJSON: true,
            }).then(() => setRefreshTrigger(!refreshTrigger));
          }
        }}>{buttonText}</Button>
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
