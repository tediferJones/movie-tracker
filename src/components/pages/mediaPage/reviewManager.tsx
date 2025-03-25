'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { useEffect, useState } from 'react';
import Loading from '@/components/subcomponents/loading';
import ReviewsDisplay from '@/components/subcomponents/reviewsDisplay';
import { inputValidation } from '@/lib/inputValidation';
import { useUser } from '@clerk/nextjs';
import { reviews } from '@/drizzle/schema';
import easyFetchV3 from '@/lib/easyFetchV3';
import ConfirmModal from '@/components/subcomponents/confirmModal';

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
  const [lockRating, setLockRating] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState('Waiting...');
  const [modalVisibile, setModalVisible] = useState(false);

  const defaultReview = {
    review: null,
    rating: null,
    watchAgain: null,
    username: undefined
  }

  const { user } = useUser();
  useEffect(() => {
    if (user?.username) {
      easyFetchV3<ExistingReview | undefined>({
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
          </div>
        </div>

        <div className='flex flex-wrap justify-between gap-4'>
          <label className='my-auto'
            htmlFor='myRating'
          >Rating: </label>
          <Input className='p-2 showOutline w-min'
            name='myRating'
            id='myRating'
            value={((existingReview.rating || 0) / 20).toFixed(2)} 
            onChange={e => setExistingReview({ 
              ...existingReview,
              rating: Number(e.target.value) * 20,
            })} 
            type='number' min={0} max={5} step={0.05} 
          />

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
            easyFetchV3({
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
            easyFetchV3({
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
